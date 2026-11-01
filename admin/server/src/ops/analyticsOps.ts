import { Database } from "bun:sqlite";
import { type Row, iso, num, str } from "./dbCommon";
import { ensureCatalog, vehicleTypeOf } from "./catalogInit";
import {
  ANALYTICS_RANGES,
  DAY_MS,
  vnDayStart,
  buildAnalyticsBuckets,
  aggregateDiscounts,
  aggregateCustomers,
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

  const { buckets, bucketIndexOf } = buildAnalyticsBuckets(
    range,
    start,
    granularity,
    todayStart,
    nonCancelled,
  );

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

  const topAll = [...aggMap.values()].map((a) => {
    const p = prodMap.get(a.productId);
    return {
      productId: a.productId,
      name: p ? str(p.name) : a.snapshotName,
      brand: p ? str(p.brand) : "",
      scale: p ? str(p.scale) : a.snapshotScale,
      vehicleType: vehicleTypeFor(a.productId),
      quantity: a.qty,
      revenue: a.revenue,
      variants: [...a.variants.values()]
        .sort((x, y) => y.qty - x.qty || y.revenue - x.revenue)
        .slice(0, 5),
    };
  });

  const topByQty = [...topAll]
    .sort((x, y) => y.quantity - x.quantity || y.revenue - x.revenue)
    .slice(0, 10);
  const topByRevenue = [...topAll]
    .sort((x, y) => y.revenue - x.revenue || y.quantity - x.quantity)
    .slice(0, 10);

  const breakdown = (keyOf: (it: Row) => string) => {
    const map = new Map<string, { key: string; revenue: number; quantity: number }>();
    for (const o of paid) {
      for (const it of itemsByOrder.get(num(o.id)) ?? []) {
        const k = keyOf(it).trim() || "Khác";
        const cur = map.get(k) ?? { key: k, revenue: 0, quantity: 0 };
        const q = num(it.quantity);
        cur.revenue += num(it.unit_price) * q;
        cur.quantity += q;
        map.set(k, cur);
      }
    }
    const totalRev = revenue || 1;
    return [...map.values()]
      .sort((x, y) => y.revenue - x.revenue)
      .map((e) => ({
        ...e,
        pct: Math.round((e.revenue / totalRev) * 1000) / 10,
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
      customerPhone: str(o.phone ?? o.customer_phone),
      itemCount: (itemsByOrder.get(num(o.id)) ?? []).reduce(
        (a, it) => a + num(it.quantity),
        0,
      ),
      total: num(o.total),
      status: str(o.status),
    })),
  };

  const discounts = aggregateDiscounts(paid);

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

  const { custMap, repeatAll } = aggregateCustomers(paid);

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
      ...discounts,
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
