import { Database } from "bun:sqlite";
import {
  type CatalogEntry,
  type CatalogKind,
  type Row,
  num,
  str,
} from "./dbCommon";
import {
  carBrandCode,
  modelMakerCode,
  scaleCode,
  vehicleTypeCode,
} from "../sku";

export const PICKUP_NAMES = [
  "Ford F-150 Raptor Mini",
  "Chevrolet Pickup 1953 Cổ Điển",
  "Toyota Hilux GR Sport Mini",
  "Nissan Navara Mini",
  "Ford Ranger Wildtrak",
  "Chevrolet Colorado",
  "Toyota Hilux Revo",
  "Ford F-150 Platinum",
  "Chevrolet Silverado",
  "Nissan Titan XD",
];

export const MOTORCYCLE_NAMES = [
  "Honda Wave Alpha",
  "Yamaha Exciter 155 VVA",
  "Vespa Sprint 125",
  "Suzuki Raider R150",
  "Yamaha MT-07",
  "Honda SH Mode 125",
  "Ducati Monster",
  "Ducati Panigale V4",
  "Honda Gold Wing",
  "Vespa GTS 300",
];

export function vehicleTypeOf(name: string): string {
  const base = name.replace(" [MẪU]", "");
  if (PICKUP_NAMES.includes(base)) return "Xe bán tải";
  if (MOTORCYCLE_NAMES.includes(base)) return "Xe máy";
  return "Ô tô";
}

export const CATALOG_TABLES: Record<CatalogKind, string> = {
  vehicleTypes: "catalog_vehicle_types",
  carBrands: "catalog_car_brands",
  modelMakers: "catalog_model_makers",
  scales: "catalog_scales",
};

export const CATALOG_HAS_CODE: Record<CatalogKind, boolean> = {
  vehicleTypes: false,
  carBrands: true,
  modelMakers: true,
  scales: true,
};

export const CATALOG_LABELS: Record<CatalogKind, string> = {
  vehicleTypes: "Loại xe",
  carBrands: "Hãng xe",
  modelMakers: "Hãng mô hình",
  scales: "Tỉ lệ",
};

export const CATALOG_CONDITION_KIND: Record<CatalogKind, string> = {
  vehicleTypes: "vehicleType",
  carBrands: "brand",
  modelMakers: "modelMaker",
  scales: "scale",
};

export function ensureCatalog(db: Database): void {
  const productCols = db.query("PRAGMA table_info(products)").all() as Row[];
  if (!productCols.some((c) => str(c.name) === "vehicle_type")) {
    db.exec("ALTER TABLE products ADD COLUMN vehicle_type TEXT NOT NULL DEFAULT ''");
  }
  const needType = db
    .query("SELECT id, name FROM products WHERE vehicle_type IS NULL OR vehicle_type = ''")
    .all() as Row[];
  for (const p of needType) {
    db.query("UPDATE products SET vehicle_type = ? WHERE id = ?").run(
      vehicleTypeOf(str(p.name)),
      num(p.id),
    );
  }

  db.exec(`CREATE TABLE IF NOT EXISTS catalog_vehicle_types (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)`);
  db.exec(`CREATE TABLE IF NOT EXISTS catalog_car_brands (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, code TEXT NOT NULL DEFAULT '')`);
  db.exec(`CREATE TABLE IF NOT EXISTS catalog_model_makers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, code TEXT NOT NULL DEFAULT '')`);
  db.exec(`CREATE TABLE IF NOT EXISTS catalog_scales (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, code TEXT NOT NULL DEFAULT '')`);

  const seedIfEmpty = (
    table: string,
    values: Array<{ name: string; code: string | null }>,
  ) => {
    const existing = db.query(`SELECT id FROM ${table} LIMIT 1`).all();
    if (existing.length > 0) return;
    for (const v of values) {
      if (v.code == null) {
        db.query(`INSERT INTO ${table} (name) VALUES (?)`).run(v.name);
      } else {
        db.query(`INSERT INTO ${table} (name, code) VALUES (?, ?)`).run(v.name, v.code);
      }
    }
  };
  const distinct = (sql: string): string[] =>
    (db.query(sql).all() as Row[])
      .map((r) => str(r.v).trim())
      .filter((v) => v.length > 0);

  seedIfEmpty(
    "catalog_vehicle_types",
    distinct("SELECT DISTINCT vehicle_type AS v FROM products ORDER BY v").map(
      (name) => ({ name, code: null }),
    ),
  );
  seedIfEmpty(
    "catalog_car_brands",
    distinct("SELECT DISTINCT brand AS v FROM products ORDER BY v").map((name) => ({
      name,
      code: carBrandCode(name) ?? name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3),
    })),
  );
  seedIfEmpty(
    "catalog_model_makers",
    distinct(
      "SELECT DISTINCT model_maker AS v FROM products WHERE model_maker IS NOT NULL AND model_maker <> '' ORDER BY v",
    ).map((name) => ({
      name,
      code: modelMakerCode(name) ?? name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3),
    })),
  );
  seedIfEmpty(
    "catalog_scales",
    distinct("SELECT DISTINCT scale AS v FROM products ORDER BY v").map((name) => ({
      name,
      code: scaleCode(name) ?? name.replace(/[^0-9]/g, ""),
    })),
  );
}

export function catalogEntries(db: Database, kind: CatalogKind): CatalogEntry[] {
  ensureCatalog(db);
  const table = CATALOG_TABLES[kind];
  const rows = db.query(`SELECT * FROM ${table} ORDER BY id ASC`).all() as Row[];
  return rows.map((r) => ({
    id: num(r.id),
    name: str(r.name),
    code: CATALOG_HAS_CODE[kind] ? str(r.code) : vehicleTypeCode(str(r.name)),
  }));
}

export function catalogFind(
  db: Database,
  kind: CatalogKind,
  name: string,
): CatalogEntry | null {
  const target = name.trim().toLowerCase();
  if (!target) return null;
  return (
    catalogEntries(db, kind).find((e) => e.name.toLowerCase() === target) ?? null
  );
}

export function normalizeCatalogCode(raw: string): string | null {
  const code = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return null;
  if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(code)) return null;
  if (code.startsWith("0")) return null;
  return code;
}

export function ensureDefaultDiscounts(db: Database): void {
  const rows = db.query("SELECT id FROM discount_codes LIMIT 1").all();
  if (rows.length > 0) return;
  db.query(
    "INSERT INTO discount_codes (code, kind, value, is_active, note, created_at) VALUES (?, 'percent', 10, 1, ?, ?) ON CONFLICT DO NOTHING",
  ).run("GIAM10", "Mã mẫu — giảm 10%", Date.now());
  db.query(
    "INSERT INTO discount_codes (code, kind, value, is_active, note, created_at) VALUES (?, 'fixed', 50000, 1, ?, ?) ON CONFLICT DO NOTHING",
  ).run("GIAM50K", "Mã mẫu — giảm 50.000₫", Date.now());
}

export function ensureCollectionTables(db: Database): void {
  ensureCatalog(db);
  db.exec(
    `CREATE TABLE IF NOT EXISTS collections (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       title TEXT NOT NULL,
       status TEXT NOT NULL DEFAULT 'draft',
       created_at INTEGER NOT NULL
     )`,
  );
  const cols = db.query("PRAGMA table_info(collections)").all() as Row[];
  const colNames = new Set(cols.map((c) => str(c.name)));
  if (!colNames.has("status")) {
    db.exec("ALTER TABLE collections ADD COLUMN status TEXT NOT NULL DEFAULT 'published'");
  }
  if (!colNames.has("kind")) {
    db.exec("ALTER TABLE collections ADD COLUMN kind TEXT NOT NULL DEFAULT 'manual'");
  }
  if (!colNames.has("conditions")) {
    db.exec("ALTER TABLE collections ADD COLUMN conditions TEXT NOT NULL DEFAULT '[]'");
  }
  const extraCols: Array<[string, string]> = [
    ["description", "ALTER TABLE collections ADD COLUMN description TEXT NOT NULL DEFAULT ''"],
    ["match_mode", "ALTER TABLE collections ADD COLUMN match_mode TEXT NOT NULL DEFAULT 'any'"],
    ["visible_on_list", "ALTER TABLE collections ADD COLUMN visible_on_list INTEGER NOT NULL DEFAULT 1"],
    ["image_key", "ALTER TABLE collections ADD COLUMN image_key TEXT NOT NULL DEFAULT ''"],
    ["thumbnail_config", "ALTER TABLE collections ADD COLUMN thumbnail_config TEXT NOT NULL DEFAULT '[]'"],
    ["seo_title", "ALTER TABLE collections ADD COLUMN seo_title TEXT NOT NULL DEFAULT ''"],
    ["seo_description", "ALTER TABLE collections ADD COLUMN seo_description TEXT NOT NULL DEFAULT ''"],
    ["base_scale", "ALTER TABLE collections ADD COLUMN base_scale TEXT"],
  ];
  for (const [name, sql] of extraCols) {
    if (!colNames.has(name)) db.exec(sql);
  }
  db.exec(
    `CREATE TABLE IF NOT EXISTS collection_products (
       collection_id INTEGER NOT NULL,
       product_id INTEGER NOT NULL,
       PRIMARY KEY (collection_id, product_id)
     )`,
  );
  const linkCols = db.query("PRAGMA table_info(collection_products)").all() as Row[];
  if (!linkCols.some((c) => str(c.name) === "position")) {
    db.exec(
      "ALTER TABLE collection_products ADD COLUMN position INTEGER NOT NULL DEFAULT 0",
    );
  }
  const scaleNames = new Set<string>();
  for (const e of catalogEntries(db, "scales")) scaleNames.add(e.name);
  for (const r of db.query("SELECT DISTINCT scale AS v FROM products").all() as Row[]) {
    const v = str(r.v).trim();
    if (v) scaleNames.add(v);
  }
  for (const scale of scaleNames) {
    const exists = db
      .query("SELECT id FROM collections WHERE base_scale = ?")
      .get(scale) as Row | null;
    if (exists) continue;
    db.query(
      `INSERT INTO collections (title, status, kind, conditions, description, match_mode, visible_on_list, image_key, thumbnail_config, seo_title, seo_description, base_scale, created_at)
       VALUES (?, 'published', 'auto', ?, '', 'all', 1, '', '[]', '', '', ?, ?)`,
    ).run(
      `Mô hình tỉ lệ ${scale}`,
      JSON.stringify([{ kind: "scale", operator: "eq", value: scale }]),
      scale,
      Date.now(),
    );
  }
}

export function ensureProductExtras(db: Database): void {
  const variantCols = db
    .query("PRAGMA table_info(product_variants)")
    .all() as Row[];
  const vNames = new Set(variantCols.map((c) => str(c.name)));
  if (!vNames.has("cost_price")) {
    db.exec("ALTER TABLE product_variants ADD COLUMN cost_price INTEGER");
  }
  if (!vNames.has("barcode")) {
    db.exec(
      "ALTER TABLE product_variants ADD COLUMN barcode TEXT NOT NULL DEFAULT ''",
    );
  }
  if (!vNames.has("variant_tag")) {
    db.exec(
      "ALTER TABLE product_variants ADD COLUMN variant_tag TEXT NOT NULL DEFAULT ''",
    );
  }
  if (!vNames.has("weight_grams")) {
    db.exec("ALTER TABLE product_variants ADD COLUMN weight_grams INTEGER");
  }
  const productCols = db.query("PRAGMA table_info(products)").all() as Row[];
  const pNames = new Set(productCols.map((c) => str(c.name)));
  if (!pNames.has("inventory_policy")) {
    db.exec(
      "ALTER TABLE products ADD COLUMN inventory_policy TEXT NOT NULL DEFAULT 'track_stop'",
    );
  }
}

export function ensureBulkUpdates(db: Database): void {
  db.exec(
    `CREATE TABLE IF NOT EXISTS bulk_updates (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       conditions TEXT NOT NULL DEFAULT '[]',
       match_mode TEXT NOT NULL DEFAULT 'all',
       variant_must_match INTEGER NOT NULL DEFAULT 0,
       actions TEXT NOT NULL DEFAULT '[]',
       updated_products INTEGER NOT NULL DEFAULT 0,
       updated_variants INTEGER NOT NULL DEFAULT 0,
       status TEXT NOT NULL DEFAULT 'done',
       created_at INTEGER NOT NULL DEFAULT 0
     )`,
  );
}

