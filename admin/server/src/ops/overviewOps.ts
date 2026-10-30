import { Database } from "bun:sqlite";
import { type Row, num } from "./dbCommon";
import { ensureDefaultDiscounts } from "./catalogInit";

export function overview(db: Database): Row {
  ensureDefaultDiscounts(db);
  const prods = db.query("SELECT sku_status FROM products").all() as Row[];
  const vars = db.query("SELECT stock FROM product_variants").all() as Row[];
  const ords = db
    .query("SELECT status, total FROM orders")
    .all() as Row[];
  const discs = db
    .query("SELECT is_active FROM discount_codes")
    .all() as Row[];
  const byStatus = (s: string) => ords.filter((o) => o.status === s);
  const revenuePaid = byStatus("done").reduce((s, o) => s + num(o.total), 0);
  return {
    totalProducts: prods.length,
    totalVariants: vars.length,
    totalStock: vars.reduce((s, v) => s + num(v.stock), 0),
    lowStockVariants: vars.filter((v) => num(v.stock) > 0 && num(v.stock) <= 3).length,
    outOfStockVariants: vars.filter((v) => num(v.stock) <= 0).length,
    totalOrders: ords.length,
    newOrders: byStatus("new").length,
    confirmedOrders: byStatus("confirmed").length,
    doneOrders: byStatus("done").length,
    cancelledOrders: byStatus("cancelled").length,
    revenueDone: revenuePaid,
    revenueAllNonCancelled: revenuePaid,
    activeDiscounts: discs.filter((d) => num(d.is_active) === 1).length,
    totalDiscounts: discs.length,
    incompleteSkuProducts: prods.filter((p) => p.sku_status !== "complete").length,
  };
}

