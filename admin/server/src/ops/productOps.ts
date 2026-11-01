import { Database } from "bun:sqlite";
import {
  type Row,
  iso,
  nullableNum,
  nullableStr,
  num,
  str,
} from "./dbCommon";
import {
  ensureCatalog,
  ensureCollectionTables,
  ensureProductExtras,
  vehicleTypeOf,
} from "./catalogInit";

export function listProducts(db: Database): Row[] {
  ensureProductExtras(db);
  ensureCatalog(db);
  const prods = db
    .query("SELECT * FROM products ORDER BY id ASC")
    .all() as Row[];
  const vars = db
    .query(
      "SELECT * FROM product_variants ORDER BY sort_order ASC, id ASC",
    )
    .all() as Row[];
  const imgs = db
    .query("SELECT * FROM product_images ORDER BY sort_order ASC, id ASC")
    .all() as Row[];
  const vBy = new Map<number, Row[]>();
  for (const v of vars) {
    const pid = num(v.product_id);
    const a = vBy.get(pid) ?? [];
    a.push(v);
    vBy.set(pid, a);
  }
  const iBy = new Map<number, Row[]>();
  for (const im of imgs) {
    const pid = num(im.product_id);
    const a = iBy.get(pid) ?? [];
    a.push(im);
    iBy.set(pid, a);
  }
  const soldRows = db
    .query(
      "SELECT product_id, COALESCE(SUM(quantity), 0) as total_sold FROM order_items GROUP BY product_id",
    )
    .all() as { product_id: number; total_sold: number }[];
  const soldBy = new Map<number, number>();
  for (const s of soldRows) {
    soldBy.set(num(s.product_id), num(s.total_sold));
  }
  return prods.map((r) => ({
    id: num(r.id),
    name: str(r.name),
    brand: str(r.brand),
    scale: str(r.scale),
    vehicleType: str(r.vehicle_type).trim() || vehicleTypeOf(str(r.name)),
    description: str(r.description),
    features: str(r.features),
    isFeatured: num(r.is_featured) === 1,
    modelMaker: nullableStr(r.model_maker),
    sku: nullableStr(r.sku),
    skuStatus: str(r.sku_status),
    internalCode: nullableStr(r.internal_code),
    inventoryPolicy: str(r.inventory_policy ?? "track_stop") || "track_stop",
    createdAt: iso(r.created_at),
    slug: str(r.slug ?? ""),
    seoTitle: str(r.seo_title ?? ""),
    seoDescription: str(r.seo_description ?? ""),
    totalSold: soldBy.get(num(r.id)) ?? 0,
    variants: (vBy.get(num(r.id)) ?? []).map((v) => ({
      id: num(v.id),
      colorName: str(v.color_name),
      price: num(v.price),
      promoPrice: nullableNum(v.promo_price),
      stock: num(v.stock),
      imageKey: str(v.image_key),
      sortOrder: num(v.sort_order),
      sku: nullableStr(v.sku),
      skuStatus: str(v.sku_status),
      internalCode: nullableStr(v.internal_code),
      costPrice: nullableNum(v.cost_price),
      barcode: str(v.barcode),
      variantTag: str(v.variant_tag),
      weightGrams: nullableNum(v.weight_grams),
    })),
    images: (iBy.get(num(r.id)) ?? []).map((im) => ({
      imageKey: str(im.image_key),
      variantId: nullableNum(im.variant_id),
    })),
  }));
}

export function deleteOneProduct(db: Database, productId: number): boolean {
  const rows = db
    .query("SELECT id FROM products WHERE id = ?")
    .all(productId) as Row[];
  if (rows.length === 0) return false;
  ensureCollectionTables(db);
  db.query("DELETE FROM collection_products WHERE product_id = ?").run(productId);
  db.query("DELETE FROM product_images WHERE product_id = ?").run(productId);
  db.query("DELETE FROM product_variants WHERE product_id = ?").run(productId);
  db.query("DELETE FROM products WHERE id = ?").run(productId);
  return true;
}

export function deleteProductsBulk(db: Database, rawIds: unknown): Row {
  const ids = [
    ...new Set(
      (Array.isArray(rawIds) ? rawIds : [])
        .map((x) => num(x))
        .filter((x) => Number.isInteger(x) && x > 0),
    ),
  ];
  if (ids.length === 0) {
    return { ok: false, error: "Chưa chọn sản phẩm nào để xóa.", deleted: 0, deletedProducts: 0 };
  }
  let deleted = 0;
  db.transaction(() => {
    for (const id of ids) if (deleteOneProduct(db, id)) deleted++;
  })();
  if (deleted === 0) {
    return { ok: false, error: "Không tìm thấy sản phẩm nào trong số đã chọn.", deleted: 0, deletedProducts: 0 };
  }
  return { ok: true, error: null, deleted, deletedProducts: deleted };
}

export function deleteVariantsBulk(db: Database, rawIds: unknown): Row {
  ensureProductExtras(db);
  const ids = [
    ...new Set(
      (Array.isArray(rawIds) ? rawIds : [])
        .map((x) => num(x))
        .filter((x) => Number.isInteger(x) && x > 0),
    ),
  ];
  if (ids.length === 0) {
    return { ok: false, error: "Chưa chọn biến thể màu nào để xóa.", deleted: 0, deletedProducts: 0 };
  }
  let deleted = 0;
  let deletedProducts = 0;
  db.transaction(() => {
    const affectedProductIds = new Set<number>();
    for (const vid of ids) {
      const v = db
        .query("SELECT id, product_id FROM product_variants WHERE id = ?")
        .get(vid) as Row | null;
      if (!v) continue;
      affectedProductIds.add(num(v.product_id));
      db.query("DELETE FROM product_images WHERE variant_id = ?").run(vid);
      db.query("DELETE FROM product_variants WHERE id = ?").run(vid);
      deleted++;
    }
    for (const pid of affectedProductIds) {
      const remaining = db
        .query(
          "SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC",
        )
        .all(pid) as Row[];
      if (remaining.length === 0) {
        if (deleteOneProduct(db, pid)) deletedProducts++;
        continue;
      }
      const first = remaining[0];
      if (!first) continue;
      db.query(
        "UPDATE products SET sku = ?, sku_status = ?, updated_at = ? WHERE id = ?",
      ).run(
        nullableStr(first.sku),
        str(first.sku_status),
        new Date().toISOString(),
        pid,
      );
    }
  })();
  if (deleted === 0) {
    return { ok: false, error: "Không tìm thấy biến thể màu nào trong số đã chọn.", deleted: 0, deletedProducts: 0 };
  }
  return { ok: true, error: null, deleted, deletedProducts };
}
