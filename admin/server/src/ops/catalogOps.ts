import { Database } from "bun:sqlite";
import {
  type CatalogEntry,
  type CatalogKind,
  type Row,
  num,
  str,
} from "./dbCommon";
import {
  CATALOG_CONDITION_KIND,
  CATALOG_HAS_CODE,
  CATALOG_LABELS,
  CATALOG_TABLES,
  catalogEntries,
  catalogFind,
  ensureCatalog,
  ensureCollectionTables,
  normalizeCatalogCode,
} from "./catalogInit";
import { parseConditions } from "./collectionHelpers";
import { generateSku } from "../sku";

export const CATALOG_PRODUCT_COLUMN: Record<CatalogKind, string> = {
  vehicleTypes: "vehicle_type",
  carBrands: "brand",
  modelMakers: "model_maker",
  scales: "scale",
};

export function catalogUsage(
  db: Database,
  kind: CatalogKind,
  name: string,
): { products: number; collections: number } {
  ensureCatalog(db);
  ensureCollectionTables(db);
  const column = CATALOG_PRODUCT_COLUMN[kind];
  const prow = db
    .query(`SELECT COUNT(*) AS n FROM products WHERE ${column} = ?`)
    .get(name) as Row | null;
  const condKind = CATALOG_CONDITION_KIND[kind];
  let collections = 0;
  const cols = db.query("SELECT kind, conditions FROM collections").all() as Row[];
  for (const c of cols) {
    if (str(c.kind) !== "auto") continue;
    if (parseConditions(c.conditions).some((x) => x.kind === condKind && x.value === name)) {
      collections++;
    }
  }
  return { products: num(prow?.n), collections };
}

export function listCatalog(db: Database): Row {
  const build = (kind: CatalogKind): Row[] =>
    catalogEntries(db, kind).map((e) => {
      const usage = catalogUsage(db, kind, e.name);
      return {
        id: e.id,
        name: e.name,
        code: e.code,
        productCount: usage.products,
        collectionCount: usage.collections,
      };
    });
  return {
    vehicleTypes: build("vehicleTypes"),
    carBrands: build("carBrands"),
    modelMakers: build("modelMakers"),
    scales: build("scales"),
  };
}

export function asCatalogKind(raw: string): CatalogKind | null {
  return raw === "vehicleTypes" || raw === "carBrands" || raw === "modelMakers" || raw === "scales"
    ? raw
    : null;
}

export function createCatalogEntry(
  db: Database,
  input: { catalog: string; name: string; code: string },
): Row {
  const kind = asCatalogKind(input.catalog);
  if (!kind) return { ok: false, error: "Danh mục không hợp lệ.", entryId: null };
  ensureCatalog(db);
  const label = CATALOG_LABELS[kind];
  const name = input.name.trim();
  if (!name) return { ok: false, error: `Thiếu tên ${label.toLowerCase()}.`, entryId: null };
  if (kind === "scales" && !/^\d+:\d+$/.test(name)) {
    return {
      ok: false,
      error: "Giá trị tỉ lệ phải theo dạng 1:64 (số:số).",
      entryId: null,
    };
  }
  if (catalogFind(db, kind, name)) {
    return { ok: false, error: `${label} “${name}” đã có trong danh mục.`, entryId: null };
  }
  let code: string | null = null;
  if (CATALOG_HAS_CODE[kind]) {
    code = normalizeCatalogCode(input.code);
    if (!code) {
      return {
        ok: false,
        error: "Mã chưa hợp lệ — mã chỉ gồm chữ, số, dấu - và _, không khoảng trắng và không bắt đầu bằng số 0 (ví dụ GTS, MB, 64).",
        entryId: null,
      };
    }
    const dupCode = catalogEntries(db, kind).find(
      (e) => (e.code ?? "").toUpperCase() === code,
    );
    if (dupCode) {
      return {
        ok: false,
        error: `Mã ${code} đã được dùng cho ${label.toLowerCase()} “${dupCode.name}”.`,
        entryId: null,
      };
    }
  }
  const table = CATALOG_TABLES[kind];
  const ins = (
    code == null
      ? db.query(`INSERT INTO ${table} (name) VALUES (?) RETURNING id`).get(name)
      : db.query(`INSERT INTO ${table} (name, code) VALUES (?, ?) RETURNING id`).get(name, code)
  ) as Row | null;
  if (!ins) return { ok: false, error: "Không thêm được mục danh mục.", entryId: null };
  return { ok: true, error: null, entryId: num(ins.id) };
}

export function deleteCatalogEntry(
  db: Database,
  input: { catalog: string; id: number },
): { ok: boolean; error: string | null } {
  const kind = asCatalogKind(input.catalog);
  if (!kind) return { ok: false, error: "Danh mục không hợp lệ." };
  ensureCatalog(db);
  const entry = catalogEntries(db, kind).find((e) => e.id === input.id);
  if (!entry) return { ok: false, error: "Không tìm thấy mục danh mục." };
  const usage = catalogUsage(db, kind, entry.name);
  if (usage.products > 0 || usage.collections > 0) {
    return {
      ok: false,
      error: `Không xóa được ${CATALOG_LABELS[kind].toLowerCase()} “${entry.name}”: đang được dùng bởi ${usage.products} sản phẩm và ${usage.collections} bộ sưu tập. Hãy đổi các sản phẩm / bộ sưu tập đó sang mục khác trước rồi mới xóa.`,
    };
  }
  db.query(`DELETE FROM ${CATALOG_TABLES[kind]} WHERE id = ?`).run(input.id);
  return { ok: true, error: null };
}

export function updateCatalogEntry(
  db: Database,
  input: { catalog: string; id: number; name: string; code: string },
): { ok: boolean; error: string | null } {
  const kind = asCatalogKind(input.catalog);
  if (!kind) return { ok: false, error: "Danh mục không hợp lệ." };
  ensureCatalog(db);
  ensureCollectionTables(db);
  const label = CATALOG_LABELS[kind];
  const entry = catalogEntries(db, kind).find((e) => e.id === input.id);
  if (!entry) return { ok: false, error: "Không tìm thấy mục danh mục." };
  const newName = input.name.trim();
  if (!newName) return { ok: false, error: `Thiếu tên ${label.toLowerCase()}.` };
  if (kind === "scales" && !/^\d+:\d+$/.test(newName)) {
    return { ok: false, error: "Giá trị tỉ lệ phải theo dạng 1:64 (số:số)." };
  }
  const dupName = catalogEntries(db, kind).find(
    (e) => e.id !== input.id && e.name.toLowerCase() === newName.toLowerCase(),
  );
  if (dupName) {
    return { ok: false, error: `${label} “${newName}” đã có trong danh mục.` };
  }
  let newCode: string | null = entry.code;
  if (CATALOG_HAS_CODE[kind]) {
    newCode = normalizeCatalogCode(input.code);
    if (!newCode) {
      return {
        ok: false,
        error: "Mã chưa hợp lệ — mã chỉ gồm chữ, số, dấu - và _, không khoảng trắng và không bắt đầu bằng số 0 (ví dụ GTS, MB, 64).",
      };
    }
    const dupCode = catalogEntries(db, kind).find(
      (e) => e.id !== input.id && (e.code ?? "").toUpperCase() === newCode,
    );
    if (dupCode) {
      return {
        ok: false,
        error: `Mã ${newCode} đã được dùng cho ${label.toLowerCase()} “${dupCode.name}”.`,
      };
    }
  }
  const nameChanged = newName !== entry.name;
  const codeChanged = CATALOG_HAS_CODE[kind] && newCode !== entry.code;
  if (!nameChanged && !codeChanged) return { ok: true, error: null };

  const column = CATALOG_PRODUCT_COLUMN[kind];
  const affected = (
    db.query(`SELECT id FROM products WHERE ${column} = ? ORDER BY id ASC`).all(entry.name) as Row[]
  ).map((r) => num(r.id));

  type SkuPlan = { productId: number; variantId: number; sku: string | null };
  const plans: SkuPlan[] = [];
  if (kind !== "vehicleTypes" && affected.length > 0) {
    const brandEntryOf = (p: Row): CatalogEntry | null =>
      kind === "carBrands" && str(p.brand) === entry.name
        ? { id: entry.id, name: newName, code: newCode }
        : catalogFind(db, "carBrands", str(p.brand));
    const makerEntryOf = (p: Row): CatalogEntry | null => {
      const mk = str(p.model_maker).trim();
      if (!mk) return null;
      return kind === "modelMakers" && mk === entry.name
        ? { id: entry.id, name: newName, code: newCode }
        : catalogFind(db, "modelMakers", mk);
    };
    const scaleEntryOf = (p: Row): CatalogEntry | null =>
      kind === "scales" && str(p.scale) === entry.name
        ? { id: entry.id, name: newName, code: newCode }
        : catalogFind(db, "scales", str(p.scale));

    const affectedSet = new Set(affected);
    const otherSkus = new Set<string>();
    const allVars = db
      .query("SELECT product_id, sku FROM product_variants WHERE sku IS NOT NULL")
      .all() as Row[];
    for (const v of allVars) {
      if (!affectedSet.has(num(v.product_id))) otherSkus.add(str(v.sku));
    }
    const plannedSkus = new Set<string>();

    for (const pid of affected) {
      const p = db.query("SELECT * FROM products WHERE id = ?").get(pid) as Row | null;
      if (!p) continue;
      const vars = db
        .query("SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC")
        .all(pid) as Row[];
      const makerE = makerEntryOf(p);
      if (!makerE) {
        for (const v of vars) plans.push({ productId: pid, variantId: num(v.id), sku: null });
        continue;
      }
      const brandE = brandEntryOf(p);
      const scaleE = scaleEntryOf(p);
      if (!brandE || !scaleE) {
        return {
          ok: false,
          error: `Sản phẩm “${str(p.name)}” đang dùng một giá trị chưa có trong danh mục nên không sinh lại được SKU — kiểm tra lại danh mục của sản phẩm đó trước.`,
        };
      }
      let brandForModel = brandE.name;
      if (kind === "carBrands") {
        const pname = str(p.name).replace(" [MẪU]", "");
        if (pname.toLowerCase().startsWith(entry.name.toLowerCase())) {
          brandForModel = entry.name;
        } else if (pname.toLowerCase().startsWith(newName.toLowerCase())) {
          brandForModel = newName;
        }
      }
      for (const v of vars) {
        const gen = generateSku({
          modelMaker: makerE.name,
          scale: scaleE.name,
          brand: brandForModel,
          productName: str(p.name),
          colorName: str(v.color_name),
          codes: {
            makerCode: makerE.code,
            scaleCode: scaleE.code,
            brandCode: brandE.code,
          },
        });
        if (gen.status !== "complete" || !gen.sku) {
          return {
            ok: false,
            error: `Không sinh lại được SKU cho sản phẩm “${str(p.name)}” (màu “${str(v.color_name)}”) bằng mã mới — đã hủy thay đổi, dữ liệu giữ nguyên.`,
          };
        }
        if (otherSkus.has(gen.sku) || plannedSkus.has(gen.sku)) {
          return {
            ok: false,
            error: `Đổi mã sẽ làm SKU ${gen.sku} bị trùng với một sản phẩm/màu khác — đã hủy thay đổi, dữ liệu giữ nguyên.`,
          };
        }
        plannedSkus.add(gen.sku);
        plans.push({ productId: pid, variantId: num(v.id), sku: gen.sku });
      }
    }
  }

  const table = CATALOG_TABLES[kind];
  if (CATALOG_HAS_CODE[kind]) {
    db.query(`UPDATE ${table} SET name = ?, code = ? WHERE id = ?`).run(
      newName,
      newCode,
      input.id,
    );
  } else {
    db.query(`UPDATE ${table} SET name = ? WHERE id = ?`).run(newName, input.id);
  }
  if (nameChanged) {
    db.query(`UPDATE products SET ${column} = ? WHERE ${column} = ?`).run(
      newName,
      entry.name,
    );
    const condKind = CATALOG_CONDITION_KIND[kind];
    const cols = db.query("SELECT id, conditions FROM collections").all() as Row[];
    for (const c of cols) {
      const conds = parseConditions(c.conditions);
      let touched = false;
      const next = conds.map((x) => {
        if (x.kind === condKind && x.value === entry.name) {
          touched = true;
          return { kind: x.kind, operator: x.operator, value: newName };
        }
        return x;
      });
      if (touched) {
        db.query("UPDATE collections SET conditions = ? WHERE id = ?").run(
          JSON.stringify(next),
          num(c.id),
        );
      }
    }
  }
  for (const plan of plans) {
    db.query("UPDATE product_variants SET sku = ?, sku_status = ? WHERE id = ?").run(
      plan.sku,
      plan.sku ? "complete" : "incomplete",
      plan.variantId,
    );
  }
  const firstPlanByProduct = new Map<number, SkuPlan>();
  for (const plan of plans) {
    if (!firstPlanByProduct.has(plan.productId)) {
      firstPlanByProduct.set(plan.productId, plan);
    }
  }
  for (const [pid, plan] of firstPlanByProduct) {
    db.query("UPDATE products SET sku = ?, sku_status = ? WHERE id = ?").run(
      plan.sku,
      plan.sku ? "complete" : "incomplete",
      pid,
    );
  }
  return { ok: true, error: null };
}

