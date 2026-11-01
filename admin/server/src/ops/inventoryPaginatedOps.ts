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
  ensureProductExtras,
  vehicleTypeOf,
} from "./catalogInit";

export interface InventoryPaginatedOptions {
  page?: number;
  pageSize?: number;
  filter?: "all" | "in" | "low" | "out";
  search?: string;
  sortDir?: "asc" | "desc";
}

export function listInventoryPaginated(db: Database, options: InventoryPaginatedOptions = {}): Row {
  ensureProductExtras(db);
  ensureCatalog(db);

  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.max(1, Math.min(200, Number(options.pageSize) || 50));
  const conds: string[] = [];
  const params: any[] = [];

  if (options.filter === "in") {
    conds.push("v.stock > 0");
  } else if (options.filter === "low") {
    conds.push("v.stock > 0 AND v.stock <= 3");
  } else if (options.filter === "out") {
    conds.push("v.stock <= 0");
  }

  if (options.search && options.search.trim()) {
    const pat = "%" + options.search.trim() + "%";
    conds.push("(p.name LIKE ? OR p.brand LIKE ? OR v.color_name LIKE ? OR v.sku LIKE ? OR v.internal_code LIKE ?)");
    params.push(pat, pat, pat, pat, pat);
  }

  const whereSql = conds.length > 0 ? " WHERE " + conds.join(" AND ") : "";

  const counts = {
    all: (db.query("SELECT COUNT(*) as c FROM product_variants").get() as { c: number }).c,
    in: (db.query("SELECT COUNT(*) as c FROM product_variants WHERE stock > 0").get() as { c: number }).c,
    low: (db.query("SELECT COUNT(*) as c FROM product_variants WHERE stock > 0 AND stock <= 3").get() as { c: number }).c,
    out: (db.query("SELECT COUNT(*) as c FROM product_variants WHERE stock <= 0").get() as { c: number }).c,
  };

  const total = (db.query(`SELECT COUNT(*) as c FROM product_variants v JOIN products p ON v.product_id = p.id${whereSql}`).get(...params) as { c: number }).c;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  const orderDir = options.sortDir === "desc" ? "DESC" : "ASC";
  const rows = db.query(`
    SELECT 
      v.id as variant_id, v.color_name, v.price, v.promo_price, v.stock, v.image_key, v.sort_order, v.sku as variant_sku, v.sku_status as variant_sku_status, v.internal_code as variant_internal_code, v.cost_price, v.barcode, v.variant_tag, v.weight_grams,
      p.id as product_id, p.name as product_name, p.brand as product_brand, p.scale as product_scale, p.vehicle_type as product_vehicle_type, p.is_featured, p.model_maker, p.sku as product_sku, p.sku_status as product_sku_status, p.internal_code as product_internal_code, p.inventory_policy, p.features, p.description, p.created_at as product_created_at, p.slug as product_slug, p.seo_title, p.seo_description
    FROM product_variants v
    JOIN products p ON v.product_id = p.id
    ${whereSql}
    ORDER BY v.stock ${orderDir}, p.name COLLATE NOCASE ASC, v.id ASC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset) as Row[];

  // Fetch full variants for the products on this page (so updating stock preserves other variants)
  const productIds = Array.from(new Set(rows.map((r) => num(r.product_id))));
  const prodVarsMap = new Map<number, Row[]>();
  if (productIds.length > 0) {
    const ph = productIds.map(() => "?").join(",");
    const allVars = db.query(`SELECT * FROM product_variants WHERE product_id IN (${ph}) ORDER BY sort_order ASC, id ASC`).all(...productIds) as Row[];
    for (const v of allVars) {
      const pid = num(v.product_id);
      const list = prodVarsMap.get(pid) ?? [];
      list.push(v);
      prodVarsMap.set(pid, list);
    }
  }

  const items = rows.map((r) => {
    const pid = num(r.product_id);
    const productVars = (prodVarsMap.get(pid) ?? []).map((v) => ({
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
    }));

    const product = {
      id: pid,
      name: str(r.product_name),
      brand: str(r.product_brand),
      scale: str(r.product_scale),
      vehicleType: str(r.product_vehicle_type).trim() || vehicleTypeOf(str(r.product_name)),
      description: str(r.description),
      features: str(r.features),
      isFeatured: num(r.is_featured) === 1,
      modelMaker: nullableStr(r.model_maker),
      sku: nullableStr(r.product_sku),
      skuStatus: str(r.product_sku_status),
      internalCode: nullableStr(r.product_internal_code),
      inventoryPolicy: str(r.inventory_policy ?? "track_stop") || "track_stop",
      createdAt: iso(r.product_created_at),
      slug: str(r.product_slug ?? ""),
      seoTitle: str(r.seo_title ?? ""),
      seoDescription: str(r.seo_description ?? ""),
      variants: productVars,
      images: [],
    };
    const variant = {
      id: num(r.variant_id),
      colorName: str(r.color_name),
      price: num(r.price),
      promoPrice: nullableNum(r.promo_price),
      stock: num(r.stock),
      imageKey: str(r.image_key),
      sortOrder: num(r.sort_order),
      sku: nullableStr(r.variant_sku),
      skuStatus: str(r.variant_sku_status),
      internalCode: nullableStr(r.variant_internal_code),
      costPrice: nullableNum(r.cost_price),
      barcode: str(r.barcode),
      variantTag: str(r.variant_tag),
      weightGrams: nullableNum(r.weight_grams),
    };
    return { product, variant };
  });

  return {
    rows: items,
    total,
    page: safePage,
    pageSize,
    totalPages,
    counts,
  };
}

