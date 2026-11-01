import { Database } from "bun:sqlite";
import {
  type Row,
  iso,
  nullableNum,
  nullableStr,
  num,
  str,
} from "./dbCommon";

export function listOrders(db: Database): Row[] {
  const rows = db
    .query("SELECT * FROM orders ORDER BY id DESC LIMIT 500")
    .all() as Row[];
  const allItems = db.query("SELECT * FROM order_items").all() as Row[];
  const byOrder = new Map<number, Row[]>();
  for (const it of allItems) {
    const oid = num(it.order_id);
    const arr = byOrder.get(oid) ?? [];
    arr.push({
      id: num(it.id),
      productId: num(it.product_id),
      variantId: nullableNum(it.variant_id),
      colorName: str(it.color_name),
      productName: str(it.product_name),
      scale: str(it.scale),
      unitPrice: num(it.unit_price),
      quantity: num(it.quantity),
      productSku: nullableStr(it.product_sku),
      variantSku: nullableStr(it.variant_sku),
    });
    byOrder.set(oid, arr);
  }
  return rows.map((r) => {
    const beforeBulk = num(r.subtotal_before_bulk);
    const hasBulk = beforeBulk > 0;
    return {
      id: num(r.id),
      customerName: str(r.customer_name),
      customerPhone: str(r.phone ?? r.customer_phone),
      customerAddress: str(r.address ?? r.customer_address),
      note: str(r.note),
      paymentMethod: str(r.payment_method),
      status: str(r.status),
      subtotalBeforeBulk: hasBulk ? beforeBulk : num(r.subtotal),
      bulkPct: hasBulk ? num(r.bulk_pct) : 0,
      bulkDiscountAmount: hasBulk ? num(r.bulk_discount_amount) : 0,
      subtotal: num(r.subtotal),
      discountCode: nullableStr(r.discount_code),
      discountAmount: num(r.discount_amount),
      subtotalAfterCoupon:
        num(r.subtotal_after_coupon) > 0
          ? num(r.subtotal_after_coupon)
          : num(r.subtotal) - num(r.discount_amount),
      shippingFee: num(r.shipping_fee),
      total: num(r.total),
      createdAt: iso(r.created_at),
      updatedAt: iso(r.updated_at || r.created_at),
      confirmedAt: r.confirmed_at ? iso(r.confirmed_at) : null,
      doneAt: r.done_at ? iso(r.done_at) : null,
      cancelledAt: r.cancelled_at ? iso(r.cancelled_at) : null,
      items: byOrder.get(num(r.id)) ?? [],
    };
  });
}

export function updateOrderStatus(
  db: Database,
  orderId: number,
  status: string,
): { ok: boolean; error: string | null } {
  const order = db
    .query("SELECT * FROM orders WHERE id = ?")
    .get(orderId) as Row | null;
  if (!order) return { ok: false, error: "Không tìm thấy đơn hàng." };
  const current = str(order.status);
  if (current === status) return { ok: true, error: null };
  const allowed: Record<string, string[]> = {
    new: ["confirmed", "cancelled"],
    confirmed: ["done", "cancelled"],
    done: [],
    cancelled: [],
  };
  if (!(allowed[current] ?? []).includes(status)) {
    return {
      ok: false,
      error: `Không đổi được đơn từ trạng thái “${current}” sang “${status}”.`,
    };
  }
  if (status === "cancelled") {
    const items = db
      .query("SELECT * FROM order_items WHERE order_id = ?")
      .all(orderId) as Row[];
    for (const it of items) {
      const qty = num(it.quantity);
      if (it.variant_id != null) {
        const v = db
          .query("SELECT * FROM product_variants WHERE id = ?")
          .get(num(it.variant_id)) as Row | null;
        if (v) {
          db.query("UPDATE product_variants SET stock = ? WHERE id = ?").run(
            num(v.stock) + qty,
            num(v.id),
          );
          continue;
        }
      }
    }
  }
  const nowIso = new Date().toISOString();
  if (status === "confirmed") {
    db.query("UPDATE orders SET status = ?, confirmed_at = ?, updated_at = ? WHERE id = ?").run(status, nowIso, nowIso, orderId);
  } else if (status === "done") {
    db.query("UPDATE orders SET status = ?, done_at = ?, updated_at = ? WHERE id = ?").run(status, nowIso, nowIso, orderId);
  } else if (status === "cancelled") {
    db.query("UPDATE orders SET status = ?, cancelled_at = ?, updated_at = ? WHERE id = ?").run(status, nowIso, nowIso, orderId);
  } else {
    db.query("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(status, nowIso, orderId);
  }
  return { ok: true, error: null };
}

export function updateOrderInfo(
  db: Database,
  input: {
    orderId: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    note: string;
  },
): { ok: boolean; error: string | null } {
  const order = db
    .query("SELECT id FROM orders WHERE id = ?")
    .get(input.orderId) as Row | null;
  if (!order) return { ok: false, error: "Không tìm thấy đơn hàng." };
  const name = input.customerName.trim();
  const phone = input.customerPhone.trim();
  const address = input.customerAddress.trim();
  if (name.length < 2) return { ok: false, error: "Tên khách hàng cần ít nhất 2 ký tự." };
  if (phone.length < 8) return { ok: false, error: "Số điện thoại chưa hợp lệ." };
  if (!address) return { ok: false, error: "Thiếu địa chỉ giao hàng." };
  db.query(
    "UPDATE orders SET customer_name = ?, phone = ?, address = ?, note = ? WHERE id = ?",
  ).run(name, phone, address, input.note.trim(), input.orderId);
  return { ok: true, error: null };
}

