import { Database } from "bun:sqlite";
import { type Row, iso, num, str } from "./dbCommon";
import { ensureCatalog, vehicleTypeOf } from "./catalogInit";
import {
  ANALYTICS_RANGES,
  DAY_MS,
  vnDateParts,
  vnDayStart,
  vnKeyDate,
  vnLabelDate,
} from "./analyticsHelpers";

export function analytics(db: Database, rangeRaw: string): Row {
  ensureCatalog(db);
  const range = (ANALYTICS_RANGES as readonly string[]).includes(rangeRaw)
    ? rangeRaw
    : "30d";
  const now = Date.now();
  const todayStart = vnDayStart(now);
  let start: number | null = null;
  let granularity = "day";
  if (range === "today") {
    start = todayStart;
    granularity = "hour";
  } else if (range === "7d") {
    start = todayStart - 6 * DAY_MS;
  } else if (range === "30d") {
    start = todayStart - 29 * DAY_MS;
  } else if (range === "90d") {
    start = todayStart - 89 * DAY_MS;
    granularity = "week";
  } else {
    start = null;
    granularity = "month";
  }

  const orderRows = db.query("SELECT * FROM orders ORDER BY id ASC").all() as Row[];
  const inRange = orderRows.filter(
    (o) => start == null || num(o.created_at) >= start,
  );
  const nonCancelled = inRange.filter((o) => str(o.status) !== "cancelled");
  const paid = inRange.filter((o) => str(o.status) === "done");
  const paidOrderCount = paid.length;
  const itemRows = db.query("SELECT * FROM order_items").all() as Row[];
  const itemsByOrder = new Map<number, Row[]>();
  for (const it of itemRows) {
    const oid = num(it.order_id);
    const arr = itemsByOrder.get(oid) ?? [];
    arr.push(it);
    itemsByOrder.set(oid, arr);
  }

  const revenue = paid.reduce((s, o) => s + num(o.total), 0);
  const orderCount = nonCancelled.length;
  const itemsSold = paid.reduce(
    (s, o) =>
      s +
      (itemsByOrder.get(num(o.id)) ?? []).reduce(
        (a, it) => a + num(it.quantity),
        0,
      ),
    0,
  );

  type Bucket = { key: string; label: string; revenue: number; orders: number };
  const buckets: Bucket[] = [];
  let bucketIndexOf: (ts: number) => number = () => -1;
  if (granularity === "hour" && start != null) {
    for (let h = 0; h < 24; h++) {
      buckets.push({
        key: `${vnKeyDate(start)}-${h}`,
        label: `${h}h`,
        revenue: 0,
        orders: 0,
      });
    }
    const s = start;
    bucketIndexOf = (ts) => Math.floor((ts - s) / 3600000);
  } else if (granularity === "day" && start != null) {
    const days = range === "7d" ? 7 : 30;
    for (let i = 0; i < days; i++) {
      const ds = start + i * DAY_MS;
      buckets.push({ key: vnKeyDate(ds), label: vnLabelDate(ds), revenue: 0, orders: 0 });
    }
    const s = start;
    bucketIndexOf = (ts) => Math.floor((vnDayStart(ts) - s) / DAY_MS);
  } else if (granularity === "week" && start != null) {
    const count = Math.ceil(90 / 7);
    for (let i = 0; i < count; i++) {
      const bs = start + i * 7 * DAY_MS;
      const be = Math.min(bs + 6 * DAY_MS, todayStart);
      buckets.push({
        key: vnKeyDate(bs),
        label: `${vnLabelDate(bs)} – ${vnLabelDate(be)}`,
        revenue: 0,
        orders: 0,
      });
    }
    const s = start;
    bucketIndexOf = (ts) => Math.floor((ts - s) / (7 * DAY_MS));
  } else {
    if (nonCancelled.length > 0) {
      const earliest = Math.min(...nonCancelled.map((o) => num(o.created_at)));
      const p0 = vnDateParts(vnDayStart(earliest));
      const p1 = vnDateParts(todayStart);
      const count = (p1.y - p0.y) * 12 + (p1.m - p0.m) + 1;
      for (let i = 0; i < count; i++) {
        const totalMonths = p0.y * 12 + p0.m + i;
        const y = Math.floor(totalMonths / 12);
        const m = totalMonths % 12;
        buckets.push({
          key: `${y}-${String(m + 1).padStart(2, "0")}`,
          label: `Tháng ${m + 1}/${y}`,
          revenue: 0,
          orders: 0,
        });
      }
      bucketIndexOf = (ts) => {
        const p = vnDateParts(vnDayStart(ts));
        return (p.y - p0.y) * 12 + (p.m - p0.m);
      };
    }
  }

  for (const o of nonCancelled) {
    const idx = bucketIndexOf(num(o.created_at));
    const b = buckets[idx];
    if (b) {
      if (str(o.status) === "done") b.revenue += num(o.total);
      b.orders += 1;
    }
  }

  const prodRows = db
    .query("SELECT id, name, brand, scale, vehicle_type FROM products")
    .all() as Row[];
  const prodMap = new Map<number, Row>();
  for (const p of prodRows) prodMap.set(num(p.id), p);
  const vehicleTypeFor = (pid: number): string => {
    const p = prodMap.get(pid);
    if (!p) return "";
    const vt = str(p.vehicle_type).trim();
    return vt || vehicleTypeOf(str(p.name));
  };

  type VariantAgg = { colorName: string; qty: number; revenue: number };
  type ProductAgg = {
    productId: number;
    snapshotName: string;
    snapshotScale: string;
    qty: number;
    revenue: number;
    variants: Map<string, VariantAgg>;
  };
  const aggMap = new Map<number, ProductAgg>();
  for (const o of paid) {
    for (const it of itemsByOrder.get(num(o.id)) ?? []) {
      const pid = num(it.product_id);
      const qty = num(it.quantity);
      const rev = num(it.unit_price) * qty;
      let a = aggMap.get(pid);
      if (!a) {
        a = {
          productId: pid,
          snapshotName: str(it.product_name),
          snapshotScale: str(it.scale),
          qty: 0,
          revenue: 0,
          variants: new Map(),
        };
        aggMap.set(pid, a);
      }
      a.qty += qty;
      a.revenue += rev;
      const color = str(it.color_name);
      const va = a.variants.get(color) ?? { colorName: color, qty: 0, revenue: 0 };
      va.qty += qty;
      va.revenue += rev;
      a.variants.set(color, va);
    }
  }
  const toProductEntry = (a: ProductAgg): Row => {
    const p = prodMap.get(a.productId);
    let best: VariantAgg | null = null;
    for (const v of a.variants.values()) {
      if (!best || v.qty > best.qty || (v.qty === best.qty && v.revenue > best.revenue)) {
        best = v;
      }
    }
    return {
      productId: a.productId,
      productName: p ? str(p.name) : a.snapshotName,
      scale: p ? str(p.scale) : a.snapshotScale,
      brand: p ? str(p.brand) : "",
      vehicleType: vehicleTypeFor(a.productId),
      qty: a.qty,
      revenue: a.revenue,
      productExists: p != null,
      bestVariant: best
        ? { colorName: best.colorName, qty: best.qty, revenue: best.revenue }
        : null,
    };
  };
  const aggList = [...aggMap.values()];
  const topByQty = [...aggList]
    .sort((x, y) => y.qty - x.qty || y.revenue - x.revenue)
    .slice(0, 10)
    .map(toProductEntry);
  const topByRevenue = [...aggList]
    .sort((x, y) => y.revenue - x.revenue || y.qty - x.qty)
    .slice(0, 10)
    .map(toProductEntry);

  const breakdown = (keyOf: (it: Row) => string): Row[] => {
    const m = new Map<
      string,
      { name: string; qty: number; revenue: number; orders: Set<number> }
    >();
    let totalRev = 0;
    for (const o of paid) {
      for (const it of itemsByOrder.get(num(o.id)) ?? []) {
        const name = keyOf(it).trim() || "Không rõ";
        const qty = num(it.quantity);
        const rev = num(it.unit_price) * qty;
        totalRev += rev;
        const e = m.get(name) ?? { name, qty: 0, revenue: 0, orders: new Set<number>() };
        e.qty += qty;
        e.revenue += rev;
        e.orders.add(num(o.id));
        m.set(name, e);
      }
    }
    return [...m.values()]
      .sort((x, y) => y.revenue - x.revenue)
      .map((e) => ({
        name: e.name,
        qty: e.qty,
        revenue: e.revenue,
        orders: e.orders.size,
        share: totalRev > 0 ? Math.round((e.revenue / totalRev) * 1000) / 10 : 0,
      }));
  };

  const byScale = breakdown((it) => {
    const p = prodMap.get(num(it.product_id));
    return p ? str(p.scale) : str(it.scale);
  });
  const byBrand = breakdown((it) => {
    const p = prodMap.get(num(it.product_id));
    return p ? str(p.brand) : "";
  });
  const byVehicleType = breakdown((it) => vehicleTypeFor(num(it.product_id)));

  const byStatus = ["new", "confirmed", "done", "cancelled"].map((s) => {
    const rows = inRange.filter((o) => str(o.status) === s);
    return {
      status: s,
      count: rows.length,
      revenue:
        s === "done" ? rows.reduce((sum, o) => sum + num(o.total), 0) : 0,
    };
  });

  const unpaidRows = inRange
    .filter((o) => {
      const s = str(o.status);
      return s === "new" || s === "confirmed";
    })
    .sort((x, y) => num(y.created_at) - num(x.created_at) || num(y.id) - num(x.id));
  const unpaidOrders = {
    count: unpaidRows.length,
    totalValue: unpaidRows.reduce((s, o) => s + num(o.total), 0),
    orders: unpaidRows.map((o) => ({
      id: num(o.id),
      createdAt: iso(o.created_at),
      customerName: str(o.customer_name),
      customerPhone: str(o.customer_phone),
      itemCount: (itemsByOrder.get(num(o.id)) ?? []).reduce(
        (a, it) => a + num(it.quantity),
        0,
      ),
      total: num(o.total),
      status: str(o.status),
    })),
  };

  let subtotalBeforeBulk = 0;
  let bulkDiscount = 0;
  let couponDiscount = 0;
  let subtotalAfterCoupon = 0;
  let shippingFee = 0;
  for (const o of paid) {
    const before = num(o.subtotal_before_bulk);
    const hasBulk = before > 0;
    subtotalBeforeBulk += hasBulk ? before : num(o.subtotal);
    bulkDiscount += hasBulk ? num(o.bulk_discount_amount) : 0;
    couponDiscount += num(o.discount_amount);
    const after = num(o.subtotal_after_coupon);
    subtotalAfterCoupon += after > 0 ? after : num(o.subtotal) - num(o.discount_amount);
    shippingFee += num(o.shipping_fee);
  }

  const stockRows = db.query("SELECT stock FROM product_variants").all() as Row[];
  const outOfStockCount = stockRows.filter((v) => num(v.stock) <= 0).length;
  const lowStockCount = stockRows.filter(
    (v) => num(v.stock) > 0 && num(v.stock) <= 3,
  ).length;
  const invRows = db
    .query(
      `SELECT v.id AS vid, v.product_id AS pid, v.color_name AS color,
              v.stock AS stock, p.name AS pname, p.scale AS pscale
         FROM product_variants v JOIN products p ON p.id = v.product_id
        WHERE v.stock <= 3
        ORDER BY v.stock ASC, p.name ASC
        LIMIT 200`,
    )
    .all() as Row[];
  const inventoryItems = invRows.map((r) => ({
    productId: num(r.pid),
    productName: str(r.pname),
    variantId: num(r.vid),
    colorName: str(r.color),
    scale: str(r.pscale),
    stock: num(r.stock),
  }));

  const custMap = new Map<
    string,
    { phone: string; name: string; orders: number; spent: number; lastTs: number }
  >();
  for (const o of paid) {
    const phone = str(o.customer_phone).trim();
    if (!phone) continue;
    const e = custMap.get(phone) ?? {
      phone,
      name: str(o.customer_name),
      orders: 0,
      spent: 0,
      lastTs: 0,
    };
    e.orders += 1;
    e.spent += num(o.total);
    if (num(o.created_at) >= e.lastTs) {
      e.lastTs = num(o.created_at);
      e.name = str(o.customer_name);
    }
    custMap.set(phone, e);
  }
  const repeatAll = [...custMap.values()]
    .filter((c) => c.orders >= 2)
    .sort((x, y) => y.orders - x.orders || y.spent - x.spent);

  return {
    range,
    granularity,
    startAt: start == null ? null : new Date(start).toISOString(),
    endAt: new Date(now).toISOString(),
    kpis: {
      revenue,
      orderCount,
      paidOrderCount,
      averageOrderValue:
        paidOrderCount > 0 ? Math.round(revenue / paidOrderCount) : 0,
      itemsSold,
    },
    series: buckets,
    topByQty,
    topByRevenue,
    byScale,
    byVehicleType,
    byBrand,
    byStatus,
    unpaidOrders,
    discounts: {
      subtotalBeforeBulk,
      bulkDiscount,
      couponDiscount,
      subtotalAfterCoupon,
      shippingFee,
      totalRevenue: revenue,
    },
    inventory: {
      lowStockCount,
      outOfStockCount,
      items: inventoryItems,
    },
    customers: {
      totalCustomers: custMap.size,
      repeatCustomerCount: repeatAll.length,
      singlePurchaseCount: custMap.size - repeatAll.length,
      hasEnoughData: paidOrderCount >= 2,
      repeatCustomers: repeatAll
        .slice(0, 10)
        .map((c) => ({ phone: c.phone, name: c.name, orders: c.orders, spent: c.spent })),
    },
  };
}
