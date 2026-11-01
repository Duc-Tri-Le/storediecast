import { defineAction, z } from "./space";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import * as schema from "./schema";
import type { VariantRow } from "./catalog";
import { computeOrderTotals } from "./pricing";
import { isValidPhone, normalizePhone } from "./phone";
import { findActiveDiscount } from "./discounts";
import {
  orderItemOut,
  orderOut,
  type StockLine,
  tryDecrement,
  incrementStock,
  createOrderResponse,
  type CreateOrderResult,
  updateOrderStatusResponse,
  type UpdateOrderStatusResult,
} from "./orderStockOps";

export { orderItemOut, orderOut };

export const createOrder = defineAction({
  request: z.object({
    customerName: z.string().min(2).max(80),
    customerPhone: z.string().min(9).max(20),
    customerAddress: z.string().min(8).max(300),
    note: z.string().max(500).default(""),
    paymentMethod: z.enum(["transfer"]).default("transfer"),
    discountCode: z.string().max(40).optional(),
    items: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          variantId: z.number().int().positive().nullable().optional(),
          quantity: z.number().int().min(1).max(20),
        }),
      )
      .min(1)
      .max(30),
  }),
  response: createOrderResponse,
  async handler(ctx, args): Promise<CreateOrderResult> {
    const db = ctx.db;
    const phone = normalizePhone(args.customerPhone);
    if (!isValidPhone(phone)) {
      return { ok: false, orderId: null, error: "Số điện thoại chưa đúng định dạng — kiểm tra lại số điện thoại để shop liên hệ và để bạn tra cứu đơn sau này.", total: 0 };
    }
    const grouped = new Map<string, StockLine>();
    for (const it of args.items) {
      const rows = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, it.productId))
        .limit(1);
      const p = rows[0];
      if (!p) {
        return { ok: false, orderId: null, error: "Có sản phẩm không còn tồn tại trong cửa hàng.", total: 0 };
      }
      const vrows = await db
        .select()
        .from(schema.variants)
        .where(eq(schema.variants.productId, p.id))
        .orderBy(asc(schema.variants.position), asc(schema.variants.id));
      let variant: VariantRow | null = null;
      if (it.variantId != null) {
        variant = vrows.find((v: VariantRow) => v.id === it.variantId) ?? null;
        if (!variant) {
          return { ok: false, orderId: null, error: "Có màu xe không còn tồn tại trong cửa hàng.", total: 0 };
        }
      } else {
        variant = vrows[0] ?? null;
      }
      if (!variant) {
        return { ok: false, orderId: null, error: "Sản phẩm chưa có biến thể màu nào.", total: 0 };
      }
      const price = variant.price;
      const promo = variant.promoPrice;
      const baseUnit = promo != null && promo > 0 ? promo : price;
      const key = `v${variant.id}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.quantity += it.quantity;
      } else {
        grouped.set(key, { product: p, variant, quantity: it.quantity, unitPrice: baseUnit });
      }
    }
    const lines = [...grouped.values()];
    for (const line of lines) {
      const stock = line.variant.stock;
      if (stock < line.quantity) {
        return {
          ok: false,
          orderId: null,
          error: `“${line.product.name}” màu ${line.variant.color} chỉ còn ${stock} chiếc, không đủ số lượng bạn chọn.`,
          total: 0,
        };
      }
    }
    const rawCode = (args.discountCode ?? "").trim().toUpperCase();
    let discountCode: string | null = null;
    let coupon: { kind: string; value: number } | null = null;
    if (rawCode !== "") {
      const found = await findActiveDiscount(db, rawCode);
      if (!found) {
        return { ok: false, orderId: null, error: "Mã giảm giá không hợp lệ. Kiểm tra lại mã rồi thử lại.", total: 0 };
      }
      discountCode = found.code;
      coupon = { kind: found.kind, value: found.value };
    }
    const totals = computeOrderTotals(
      lines.map((l) => ({ unitPrice: l.unitPrice, quantity: l.quantity })),
      coupon,
    );
    const decremented: StockLine[] = [];
    for (const line of lines) {
      const okDec = await tryDecrement(db, line);
      if (!okDec) {
        for (const done of decremented) {
          await incrementStock(db, done);
        }
        return {
          ok: false,
          orderId: null,
          error: `“${line.product.name}” màu ${line.variant.color} vừa hết đủ số lượng bạn chọn — giảm số lượng rồi thử lại nhé.`,
          total: 0,
        };
      }
      decremented.push(line);
    }
    let orderId: number | null = null;
    const now = new Date().toISOString();
    try {
      const inserted = await db
        .insert(schema.orders)
        .values({
          customerName: args.customerName.trim(),
          phone: phone,
          address: args.customerAddress.trim(),
          note: args.note.trim(),
          paymentMethod: args.paymentMethod,
          paymentStatus: "pending",
          status: "new",
          subtotalBeforeBulk: totals.subtotalBeforeBulk,
          bulkPct: totals.bulkPct,
          bulkDiscount: totals.bulkDiscountAmount,
          discountCode: discountCode ?? "",
          discountAmount: totals.discountAmount,
          shippingFee: totals.shippingFee,
          total: totals.total,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.orders.id });
      const order = inserted[0];
      if (!order) throw new Error("insert order failed");
      orderId = order.id;
      for (const line of lines) {
        await db.insert(schema.orderLines).values({
          orderId: order.id,
          productId: line.product.id,
          variantId: line.variant.id,
          productName: line.product.name,
          color: line.variant.color,
          scale: line.product.tiLe,
          sku: line.variant.sku ?? null,
          unitPrice: line.unitPrice,
          qty: line.quantity,
          lineTotal: line.unitPrice * line.quantity,
        });
      }
    } catch {
      if (orderId != null) {
        await db.delete(schema.orderLines).where(eq(schema.orderLines.orderId, orderId));
        await db.delete(schema.orders).where(eq(schema.orders.id, orderId));
      }
      for (const done of decremented) {
        await incrementStock(db, done);
      }
      return { ok: false, orderId: null, error: "Không tạo được đơn, vui lòng thử lại.", total: 0 };
    }
    return { ok: true, orderId, error: null, total: totals.total };
  },
});

export const listOrders = defineAction({
  request: z.object({
    phone: z.string().default(""),
    orderId: z.number().int().positive().optional(),
  }),
  response: z.object({ orders: z.array(orderOut) }),
  async handler(ctx, args) {
    const db = ctx.db;
    const phone = normalizePhone(args.phone);
    const hasValidPhone = isValidPhone(phone);
    if (!hasValidPhone && !args.orderId) return { orders: [] };

    let rows: any[] = [];
    if (args.orderId && hasValidPhone) {
      rows = await db
        .select()
        .from(schema.orders)
        .where(and(eq(schema.orders.id, args.orderId), eq(schema.orders.phone, phone)))
        .limit(1);
    } else if (args.orderId) {
      rows = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, args.orderId))
        .limit(1);
    } else {
      rows = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.phone, phone))
        .orderBy(desc(schema.orders.id))
        .limit(100);
    }
    const ids = rows.map((r: any) => r.id);
    const allItems = ids.length
      ? await db.select().from(schema.orderLines).where(inArray(schema.orderLines.orderId, ids))
      : [];
    const byOrder = new Map<number, Array<z.infer<typeof orderItemOut>>>();
    for (const it of allItems) {
      const arr = byOrder.get(it.orderId) ?? [];
      arr.push({
        id: it.id,
        productId: it.productId ?? 0,
        variantId: it.variantId ?? null,
        colorName: it.color ?? "",
        productName: it.productName,
        scale: it.scale,
        unitPrice: it.unitPrice,
        quantity: it.qty,
      });
      byOrder.set(it.orderId, arr);
    }
    return {
      orders: rows.map((r: any) => {
        const subtotal = (r.subtotalBeforeBulk ?? 0) - (r.bulkDiscount ?? 0);
        const subtotalAfterCoupon = subtotal - (r.discountAmount ?? 0);
        return {
          id: r.id,
          customerName: r.customerName,
          customerPhone: r.phone,
          customerAddress: r.address,
          note: r.note,
          paymentMethod: r.paymentMethod,
          status: r.status,
          subtotalBeforeBulk: r.subtotalBeforeBulk ?? 0,
          bulkPct: r.bulkPct ?? 0,
          bulkDiscountAmount: r.bulkDiscount ?? 0,
          subtotal: subtotal,
          discountCode: r.discountCode || null,
          discountAmount: r.discountAmount ?? 0,
          subtotalAfterCoupon: subtotalAfterCoupon,
          shippingFee: r.shippingFee ?? 30000,
          total: r.total,
          createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt).toISOString(),
          items: byOrder.get(r.id) ?? [],
        };
      }),
    };
  },
});

export const updateOrderStatus = defineAction({
  request: z.object({
    orderId: z.number().int().positive(),
    phone: z.string().min(9).max(20),
    status: z.literal("cancelled"),
  }),
  response: updateOrderStatusResponse,
  async handler(ctx, args): Promise<UpdateOrderStatusResult> {
    const db = ctx.db;
    const rows = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, args.orderId))
      .limit(1);
    const order = rows[0];
    if (!order) return { ok: false, error: "Không tìm thấy đơn hàng." };
    if (normalizePhone(order.phone) !== normalizePhone(args.phone)) {
      return { ok: false, error: "Số điện thoại không khớp với đơn này — chỉ chủ đơn mới hủy được." };
    }
    if (order.status === "cancelled") return { ok: true, error: null };
    if (order.status !== "new") {
      return { ok: false, error: "Đơn đã được shop xử lý, không tự hủy được nữa — vui lòng liên hệ shop." };
    }
    const nowIso = new Date().toISOString();
    const flipped = await db
      .update(schema.orders)
      .set({ status: "cancelled", cancelledAt: nowIso, updatedAt: nowIso })
      .where(and(eq(schema.orders.id, args.orderId), eq(schema.orders.status, "new")))
      .returning({ id: schema.orders.id });
    if (flipped.length === 0) {
      const again = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, args.orderId))
        .limit(1);
      if (again[0]?.status === "cancelled") return { ok: true, error: null };
      return { ok: false, error: "Đơn đã được shop xử lý, không tự hủy được nữa — vui lòng liên hệ shop." };
    }
    const items = await db
      .select()
      .from(schema.orderLines)
      .where(eq(schema.orderLines.orderId, args.orderId));
    for (const it of items) {
      if (it.variantId != null) {
        await db
          .update(schema.variants)
          .set({ stock: sql`${schema.variants.stock} + ${it.qty}` })
          .where(eq(schema.variants.id, it.variantId));
      }
    }
    return { ok: true, error: null };
  },
});
