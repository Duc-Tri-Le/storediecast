import { type Row, num, str } from "./dbCommon";

export const ANALYTICS_RANGES = ["today", "7d", "30d", "90d", "all"] as const;
export const DAY_MS = 86400000;
export const VN_OFFSET_MS = 7 * 3600000;

export function vnDayStart(ms: number): number {
  const d = new Date(ms + VN_OFFSET_MS);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - VN_OFFSET_MS;
}

export function vnDateParts(dayStartMs: number): { y: number; m: number; d: number } {
  const d = new Date(dayStartMs + VN_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
}

export function vnLabelDate(dayStartMs: number): string {
  const p = vnDateParts(dayStartMs);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(p.d)}/${pad(p.m + 1)}`;
}

export function vnKeyDate(dayStartMs: number): string {
  const p = vnDateParts(dayStartMs);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${p.y}-${pad(p.m + 1)}-${pad(p.d)}`;
}

export type Bucket = { key: string; label: string; revenue: number; orders: number };

export function buildAnalyticsBuckets(
  range: string,
  start: number | null,
  granularity: string,
  todayStart: number,
  nonCancelled: Row[],
): { buckets: Bucket[]; bucketIndexOf: (ts: number) => number } {
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

  return { buckets, bucketIndexOf };
}

export function aggregateDiscounts(paid: Row[]) {
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
  return {
    subtotalBeforeBulk,
    bulkDiscount,
    couponDiscount,
    subtotalAfterCoupon,
    shippingFee,
  };
}

export function aggregateCustomers(paid: Row[]) {
  const custMap = new Map<
    string,
    { phone: string; name: string; orders: number; spent: number; lastTs: number }
  >();
  for (const o of paid) {
    const phone = str(o.phone ?? o.customer_phone).trim();
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
    custMap,
    repeatAll,
  };
}
