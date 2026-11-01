import { Database } from "bun:sqlite";
import {
  type Row,
  iso,
  nullableNum,
  nullableStr,
  num,
  str,
} from "./dbCommon";

export interface OrderPaginatedOptions {
  page?: number;
  pageSize?: number;
  tab?: "all" | "open" | "hold" | "closed";
  search?: string;
}

export function listOrdersPaginated(db: Database, options: OrderPaginatedOptions = {}): Row {
  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.max(1, Math.min(200, Number(options.pageSize) || 50));
  const conds: string[] = [];
  const params: any[] = [];

  if (options.tab && options.tab !== "all") {
    if (options.tab === "open") conds.push("status = 'new'");
    else if (options.tab === "hold") conds.push("status = 'confirmed'");
    else if (options.tab === "closed") conds.push("status IN ('done', 'cancelled')");
  }

  if (options.search && options.search.trim()) {
    const pat = "%" + options.search.trim() + "%";
    conds.push("(customer_name LIKE ? OR phone LIKE ? OR CAST(id AS TEXT) LIKE ?)");
    params.push(pat, pat, pat);
  }

  const whereSql = conds.length > 0 ? " WHERE " + conds.join(" AND ") : "";

  const counts = {
    all: (db.query("SELECT COUNT(*) as c FROM orders").get() as { c: number }).c,
    open: (db.query("SELECT COUNT(*) as c FROM orders WHERE status = 'new'").get() as { c: number }).c,
    hold: (db.query("SELECT COUNT(*) as c FROM orders WHERE status = 'confirmed'").get() as { c: number }).c,
    closed: (db.query("SELECT COUNT(*) as c FROM orders WHERE status IN ('done', 'cancelled')").get() as { c: number }).c,
  };

  const total = (db.query(`SELECT COUNT(*) as c FROM orders${whereSql}`).get(...params) as { c: number }).c;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  const rows = db.query(`SELECT * FROM orders${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset) as Row[];
  const orderIds = rows.map((r) => num(r.id));
  const byOrder = new Map<number, Row[]>();
  if (orderIds.length > 0) {
    const ph = orderIds.map(() => "?").join(",");
    const items = db.query(`SELECT * FROM order_items WHERE order_id IN (${ph})`).all(...orderIds) as Row[];
    for (const it of items) {
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
  }

  const orders = rows.map((r) => {
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

  return {
    orders,
    total,
    page: safePage,
    pageSize,
    totalPages,
    counts,
  };
}

