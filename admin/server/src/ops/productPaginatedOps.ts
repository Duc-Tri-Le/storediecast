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

export interface ProductPaginatedOptions {
  page?: number;
  pageSize?: number;
  tab?: "all" | "in" | "out" | "bestSelling";
  scale?: string | null;
  brand?: string | null;
  vehicleType?: string | null;
  search?: string;
  sort?:
    | "default"
    | "nameAsc"
    | "nameDesc"
    | "priceAsc"
    | "priceDesc"
    | "bestSelling"
    | "bestRevenue"
    | "salesAsc";
}

export function listProductsPaginated(db: Database, options: ProductPaginatedOptions = {}): Row {
  ensureProductExtras(db);
  ensureCatalog(db);
  db.run("CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)");

  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.max(1, Math.min(200, Number(options.pageSize) || 50));

  const baseConds: string[] = [];
  const baseParams: any[] = [];

  if (options.scale && options.scale !== "all") {
    baseConds.push("p.scale = ?");
    baseParams.push(options.scale);
  }
  if (options.brand && options.brand !== "all") {
    baseConds.push("p.brand = ?");
    baseParams.push(options.brand);
  }
  if (options.vehicleType && options.vehicleType !== "all") {
    let vt = options.vehicleType;
    if (vt === "oto" || vt === "car") vt = "Ô tô";
    else if (vt === "xemay" || vt === "moto") vt = "Xe máy";
    else if (vt === "bantai" || vt === "pickup") vt = "Xe bán tải";
    baseConds.push("(p.vehicle_type = ? OR (p.vehicle_type = '' AND p.loai_xe = ?))");
    baseParams.push(vt, vt);
  }
  if (options.search && options.search.trim()) {
    const q = "%" + options.search.trim() + "%";
    baseConds.push(
      "(p.name LIKE ? OR p.brand LIKE ? OR p.model_maker LIKE ? OR p.sku LIKE ? OR EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.sku LIKE ?))",
    );
    baseParams.push(q, q, q, q, q);
  }

  const baseWhereSql = baseConds.length > 0 ? " WHERE " + baseConds.join(" AND ") : "";

  const countAllRow = db.query(`SELECT COUNT(*) as c FROM products p ${baseWhereSql}`).get(...baseParams) as { c: number } | null;
  const inCondSql = baseConds.length > 0
    ? ` WHERE ${baseConds.join(" AND ")} AND (SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id) > 0`
    : ` WHERE (SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id) > 0`;
  const countInRow = db.query(`SELECT COUNT(*) as c FROM products p ${inCondSql}`).get(...baseParams) as { c: number } | null;

  const outCondSql = baseConds.length > 0
    ? ` WHERE ${baseConds.join(" AND ")} AND (SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id) <= 0`
    : ` WHERE (SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id) <= 0`;
  const countOutRow = db.query(`SELECT COUNT(*) as c FROM products p ${outCondSql}`).get(...baseParams) as { c: number } | null;

  const bestSellingCondSql = baseConds.length > 0
    ? ` WHERE ${baseConds.join(" AND ")} AND (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.product_id = p.id) > 0`
    : ` WHERE (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.product_id = p.id) > 0`;
  const countBestSellingRow = db.query(`SELECT COUNT(*) as c FROM products p ${bestSellingCondSql}`).get(...baseParams) as { c: number } | null;

  const counts = {
    all: countAllRow?.c ?? 0,
    in: countInRow?.c ?? 0,
    out: countOutRow?.c ?? 0,
    bestSelling: countBestSellingRow?.c ?? 0,
  };

  const fullConds = [...baseConds];
  const fullParams = [...baseParams];

  if (options.tab === "in") {
    fullConds.push("(SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id) > 0");
  } else if (options.tab === "out") {
    fullConds.push("(SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id) <= 0");
  } else if (options.tab === "bestSelling") {
    fullConds.push("(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.product_id = p.id) > 0");
  }

  const fullWhereSql = fullConds.length > 0 ? " WHERE " + fullConds.join(" AND ") : "";
  const totalRow = db.query(`SELECT COUNT(*) as c FROM products p ${fullWhereSql}`).get(...fullParams) as { c: number } | null;
  const total = totalRow?.c ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  let sortSql = "ORDER BY p.id DESC";
  switch (options.sort) {
    case "nameAsc":
      sortSql = "ORDER BY p.name COLLATE NOCASE ASC";
      break;
    case "nameDesc":
      sortSql = "ORDER BY p.name COLLATE NOCASE DESC";
      break;
    case "priceAsc":
      sortSql = "ORDER BY (SELECT MIN(COALESCE(v.promo_price, v.price)) FROM product_variants v WHERE v.product_id = p.id) ASC, p.id DESC";
      break;
    case "priceDesc":
      sortSql = "ORDER BY (SELECT MAX(COALESCE(v.promo_price, v.price)) FROM product_variants v WHERE v.product_id = p.id) DESC, p.id DESC";
      break;
    case "bestSelling":
      sortSql = "ORDER BY (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.product_id = p.id) DESC, p.id DESC";
      break;
    case "bestRevenue":
      sortSql = "ORDER BY (SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) FROM order_items oi WHERE oi.product_id = p.id) DESC, p.id DESC";
      break;
    case "salesAsc":
      sortSql = "ORDER BY (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.product_id = p.id) ASC, p.id DESC";
      break;
    default:
      sortSql = "ORDER BY p.created_at DESC, p.id DESC";
      break;
  }

  // LIMIT ? OFFSET ? - ONLY loads requested page from database
  const prods = db
    .query(`SELECT p.* FROM products p ${fullWhereSql} ${sortSql} LIMIT ? OFFSET ?`)
    .all(...fullParams, pageSize, offset) as Row[];

  const ids = prods.map((r) => num(r.id));
  const vBy = new Map<number, Row[]>();
  const iBy = new Map<number, Row[]>();
  const soldBy = new Map<number, number>();

  if (ids.length > 0) {
    const ph = ids.map(() => "?").join(",");
    const vars = db
      .query(`SELECT * FROM product_variants WHERE product_id IN (${ph}) ORDER BY sort_order ASC, id ASC`)
      .all(...ids) as Row[];
    for (const v of vars) {
      const pid = num(v.product_id);
      const a = vBy.get(pid) ?? [];
      a.push(v);
      vBy.set(pid, a);
    }
    const imgs = db
      .query(`SELECT * FROM product_images WHERE product_id IN (${ph}) ORDER BY sort_order ASC, id ASC`)
      .all(...ids) as Row[];
    for (const im of imgs) {
      const pid = num(im.product_id);
      const a = iBy.get(pid) ?? [];
      a.push(im);
      iBy.set(pid, a);
    }
    const soldRows = db
      .query(
        `SELECT product_id, COALESCE(SUM(quantity), 0) as total_sold FROM order_items WHERE product_id IN (${ph}) GROUP BY product_id`,
      )
      .all(...ids) as { product_id: number; total_sold: number }[];
    for (const s of soldRows) {
      soldBy.set(num(s.product_id), num(s.total_sold));
    }
  }

  const products = prods.map((r) => ({
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

  return {
    products,
    total,
    page: safePage,
    pageSize,
    totalPages,
    counts,
  };
}

