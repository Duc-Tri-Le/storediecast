import { Database } from "bun:sqlite";
import {
  type CatalogKind,
  type CollectionCondition,
  type Row,
  type ThumbnailOption,
  nullableStr,
  num,
  str,
} from "./dbCommon";
export type { CollectionCondition };
import { CATALOG_LABELS, catalogFind } from "./catalogInit";

export const CONDITION_OPERATORS = ["eq", "neq", "contains", "notContains"];

export function parseConditions(raw: unknown): CollectionCondition[] {
  try {
    const parsed = JSON.parse(str(raw) || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is CollectionCondition =>
          typeof x === "object" &&
          x != null &&
          typeof (x as CollectionCondition).kind === "string" &&
          typeof (x as CollectionCondition).value === "string",
      )
      .map((x) => ({
        kind: x.kind as any,
        operator: (CONDITION_OPERATORS.includes(x.operator) ? x.operator : "eq") as any,
        value: x.value,
      }));
  } catch {
    return [];
  }
}

export function parseThumbnailConfig(raw: unknown): ThumbnailOption[][] {
  try {
    const parsed = JSON.parse(str(raw) || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((g): g is unknown[] => Array.isArray(g))
      .map((g) =>
        g
          .filter(
            (x): x is ThumbnailOption =>
              typeof x === "object" &&
              x != null &&
              typeof (x as ThumbnailOption).name === "string" &&
              typeof (x as ThumbnailOption).value === "string",
          )
          .map((x) => ({ name: x.name.slice(0, 60), value: x.value.slice(0, 120) })),
      )
      .filter((g) => g.length > 0);
  } catch {
    return [];
  }
}

export function sanitizeThumbnailConfig(raw: unknown): ThumbnailOption[][] {
  return parseThumbnailConfig(typeof raw === "string" ? raw : JSON.stringify(raw ?? []));
}

export function validCollectionImageKey(key: string): boolean {
  if (!key) return true;
  if (/^https?:\/\//i.test(key)) {
    try {
      new URL(key);
      return key.length <= 1500000;
    } catch {
      return false;
    }
  }
  return (
    /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(key) &&
    key.length <= 1500000
  );
}

export function allProductTags(db: Database): string[] {
  const rows = db.query("SELECT features FROM products").all() as Row[];
  const set = new Set<string>();
  for (const r of rows) {
    for (const t of str(r.features).split("·")) {
      const v = t.trim();
      if (v) set.add(v);
    }
  }
  return [...set];
}

export const CONDITION_KIND_TO_CATALOG: Record<string, CatalogKind> = {
  scale: "scales",
  brand: "carBrands",
  vehicleType: "vehicleTypes",
  modelMaker: "modelMakers",
};

export function validateConditions(
  db: Database,
  raw: unknown,
): { conditions: CollectionCondition[] } | { error: string } {
  const list = Array.isArray(raw) ? raw : [];
  const out: CollectionCondition[] = [];
  for (const item of list) {
    const kind = str((item as Row | null)?.kind) as any;
    const value = str((item as Row | null)?.value).trim();
    const operatorRaw = str((item as Row | null)?.operator);
    const operator = (CONDITION_OPERATORS.includes(operatorRaw) ? operatorRaw : "eq") as any;
    if (kind === "tag") {
      const tag = allProductTags(db).find(
        (t) => t.toLowerCase() === value.toLowerCase(),
      );
      if (!tag) {
        return {
          error: `Điều kiện Thẻ “${value}” không khớp thẻ nào đang có trên sản phẩm. Chọn một thẻ đang có.`,
        };
      }
      if (!out.some((c) => c.kind === kind && c.operator === operator && c.value === tag)) {
        out.push({ kind, operator, value: tag });
      }
      continue;
    }
    const catalogKind = CONDITION_KIND_TO_CATALOG[kind];
    if (!catalogKind) {
      return { error: `Loại điều kiện “${kind}” không hợp lệ.` };
    }
    const entry = catalogFind(db, catalogKind, value);
    if (!entry) {
      return {
        error: `Điều kiện ${CATALOG_LABELS[catalogKind]} “${value}” chưa có trong Quản lý danh mục → ${CATALOG_LABELS[catalogKind]}. Chọn một giá trị đang có trong danh mục.`,
      };
    }
    if (!out.some((c) => c.kind === kind && c.operator === operator && c.value === entry.name)) {
      out.push({ kind, operator, value: entry.name });
    }
  }
  return { conditions: out };
}

export function validateBulkConditions(
  raw: unknown,
): { conditions: CollectionCondition[] } | { error: string } {
  const list = Array.isArray(raw) ? raw : [];
  const out: CollectionCondition[] = [];
  const validKinds = ["scale", "brand", "vehicleType", "modelMaker", "tag"];
  for (const item of list) {
    const kind = str((item as Row | null)?.kind) as any;
    const value = str((item as Row | null)?.value).trim();
    const operatorRaw = str((item as Row | null)?.operator);
    const operator = (CONDITION_OPERATORS.includes(operatorRaw) ? operatorRaw : "eq") as any;
    if (!value) continue;
    if (!validKinds.includes(kind)) {
      return { error: `Loại điều kiện “${kind}” không hợp lệ.` };
    }
    if (
      !out.some(
        (c) =>
          c.kind === kind &&
          c.operator === operator &&
          c.value.toLowerCase() === value.toLowerCase(),
      )
    ) {
      out.push({ kind, operator, value });
    }
  }
  return { conditions: out };
}

export function validCollectionStatus(s: string): boolean {
  return s === "published" || s === "draft";
}

export function checkProductIds(
  db: Database,
  raw: unknown,
): { ids: number[] } | { error: string } {
  const list = Array.isArray(raw) ? raw.map((x) => num(x)) : [];
  const ids = [...new Set(list.filter((x) => Number.isInteger(x) && x > 0))];
  for (const pid of ids) {
    const found = db
      .query("SELECT id FROM products WHERE id = ?")
      .get(pid) as Row | null;
    if (!found) return { error: `Không tìm thấy sản phẩm #${pid} để đưa vào bộ sưu tập.` };
  }
  return { ids };
}

export function conditionsSignature(conds: CollectionCondition[]): string {
  return conds
    .filter((c) => c.value && c.value.trim())
    .map((c) => `${c.kind}:${c.operator}:${c.value.trim().toLowerCase()}`)
    .sort()
    .join("&&");
}

export function checkDuplicateCollectionConditions(
  db: Database,
  conditions: CollectionCondition[],
  excludeId?: number,
): { message: string; duplicateTitle: string } | null {
  const validConds = conditions.filter((c) => c.value && c.value.trim());
  if (validConds.length === 0) return null;

  const currentSig = conditionsSignature(validConds);

  const all = db
    .query("SELECT id, title, kind, conditions, base_scale FROM collections")
    .all() as Row[];

  for (const col of all) {
    const colId = num(col.id);
    if (excludeId && colId === excludeId) continue;
    const colTitle = str(col.title);
    const colBaseScale = nullableStr(col.base_scale);
    const otherConds = parseConditions(col.conditions).filter((c) => c.value && c.value.trim());

    // 1. Kiểm tra nếu bộ hiện tại có TẬP ĐIỀU KIỆN GIỐNG HỆT bộ khác
    if (otherConds.length === validConds.length && otherConds.length > 0) {
      const otherSig = conditionsSignature(otherConds);
      if (currentSig === otherSig) {
        return {
          message: `Bộ sưu tập này có cùng bộ điều kiện lọc giống hệt bộ sưu tập “${colTitle}”.`,
          duplicateTitle: colTitle,
        };
      }
    }

    // 2. Kiểm tra bộ theo tỉ lệ gốc (base_scale):
    const first = validConds[0];
    if (validConds.length === 1 && first && first.kind === "scale" && first.operator === "eq") {
      const scaleVal = first.value.trim().toLowerCase();
      if (colBaseScale && colBaseScale.trim().toLowerCase() === scaleVal) {
        return {
          message: `Tỉ lệ “${first.value}” đã có bộ sưu tập theo tỉ lệ riêng là “${colTitle}”. Đổi bộ này sang tỉ lệ “${first.value}” sẽ trùng với bộ đó.`,
          duplicateTitle: colTitle,
        };
      }
    }
  }

  return null;
}

export type CollectionDetailInput = {
  description?: string;
  matchMode?: string;
  visible?: boolean;
  imageKey?: string;
  thumbnailConfig?: unknown;
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
};
