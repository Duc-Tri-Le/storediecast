import { Database } from "bun:sqlite";
import { type Row, iso, nullableStr, num, str } from "./dbCommon";
import { ensureCollectionTables } from "./catalogInit";
import {
  type CollectionCondition,
  type CollectionDetailInput,
  checkProductIds,
  parseConditions,
  parseThumbnailConfig,
  sanitizeThumbnailConfig,
  validateConditions,
  validCollectionImageKey,
  validCollectionStatus,
} from "./collectionHelpers";

export function listCollections(db: Database): Row[] {
  ensureCollectionTables(db);
  const cols = db
    .query("SELECT * FROM collections ORDER BY created_at DESC, id DESC")
    .all() as Row[];
  const links = db
    .query(
      "SELECT collection_id, product_id FROM collection_products ORDER BY position ASC, product_id ASC",
    )
    .all() as Row[];
  const byCol = new Map<number, number[]>();
  for (const l of links) {
    const cid = num(l.collection_id);
    const arr = byCol.get(cid) ?? [];
    arr.push(num(l.product_id));
    byCol.set(cid, arr);
  }
  return cols.map((c) => ({
    id: num(c.id),
    title: str(c.title),
    status: str(c.status),
    kind: str(c.kind ?? "manual") || "manual",
    conditions: parseConditions(c.conditions),
    description: str(c.description ?? ""),
    matchMode: str(c.match_mode ?? "any") === "all" ? "all" : "any",
    visible: num(c.visible_on_list ?? 1) === 1,
    imageKey: str(c.image_key ?? ""),
    thumbnailConfig: parseThumbnailConfig(c.thumbnail_config),
    seoTitle: str(c.seo_title ?? ""),
    seoDescription: str(c.seo_description ?? ""),
    baseScale: nullableStr(c.base_scale),
    productIds: byCol.get(num(c.id)) ?? [],
    createdAt: iso(c.created_at),
  }));
}

export function createCollection(
  db: Database,
  input: {
    title: string;
    status: string;
    kind: string;
    conditions: unknown;
    productIds: unknown;
  } & CollectionDetailInput,
): Row {
  ensureCollectionTables(db);
  const title = input.title.trim();
  if (title.length < 2) {
    return { ok: false, error: "Tên bộ sưu tập cần ít nhất 2 ký tự.", collectionId: null };
  }
  if (!validCollectionStatus(input.status)) {
    return { ok: false, error: "Trạng thái bộ sưu tập không hợp lệ.", collectionId: null };
  }
  const kind = input.kind === "auto" ? "auto" : "manual";
  let conditions: CollectionCondition[] = [];
  const rawConditions = Array.isArray(input.conditions) ? input.conditions : [];
  if (rawConditions.length > 0 || kind === "auto") {
    const validated = validateConditions(db, input.conditions);
    if ("error" in validated) {
      return { ok: false, error: validated.error, collectionId: null };
    }
    conditions = validated.conditions;
    if (kind === "auto" && conditions.length === 0) {
      return {
        ok: false,
        error: "Bộ sưu tập tự động cần ít nhất một điều kiện theo danh mục.",
        collectionId: null,
      };
    }
  }
  const imageKey = (input.imageKey ?? "").trim();
  if (!validCollectionImageKey(imageKey)) {
    return { ok: false, error: "Ảnh bộ sưu tập không hợp lệ.", collectionId: null };
  }
  const checked = checkProductIds(db, kind === "manual" ? input.productIds : []);
  if ("error" in checked) return { ok: false, error: checked.error, collectionId: null };
  const ins = db
    .query(
      `INSERT INTO collections (title, status, kind, conditions, description, match_mode, visible_on_list, image_key, thumbnail_config, seo_title, seo_description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    )
    .get(
      title,
      input.status,
      kind,
      JSON.stringify(conditions),
      (input.description ?? "").trim(),
      input.matchMode === "all" ? "all" : "any",
      input.visible === false ? 0 : 1,
      imageKey,
      JSON.stringify(sanitizeThumbnailConfig(input.thumbnailConfig)),
      (input.seoTitle ?? "").trim(),
      (input.seoDescription ?? "").trim(),
      Date.now(),
    ) as Row | null;
  if (!ins) return { ok: false, error: "Không tạo được bộ sưu tập.", collectionId: null };
  const cid = num(ins.id);
  checked.ids.forEach((pid, idx) => {
    db.query(
      "INSERT OR IGNORE INTO collection_products (collection_id, product_id, position) VALUES (?, ?, ?)",
    ).run(cid, pid, idx);
  });
  return { ok: true, error: null, collectionId: cid };
}

export function updateCollection(
  db: Database,
  input: {
    id: number;
    title: string;
    status: string;
    conditions?: unknown;
    kind?: string;
  } & CollectionDetailInput,
): { ok: boolean; error: string | null } {
  ensureCollectionTables(db);
  const existing = db
    .query("SELECT id, kind, base_scale, conditions FROM collections WHERE id = ?")
    .get(input.id) as Row | null;
  if (!existing) return { ok: false, error: "Không tìm thấy bộ sưu tập." };
  const title = input.title.trim();
  if (title.length < 2) return { ok: false, error: "Tên bộ sưu tập cần ít nhất 2 ký tự." };
  if (!validCollectionStatus(input.status)) {
    return { ok: false, error: "Trạng thái bộ sưu tập không hợp lệ." };
  }
  const isBase = existing.base_scale != null && str(existing.base_scale) !== "";
  const currentKind = str(existing.kind) === "auto" ? "auto" : "manual";
  let nextKind = currentKind;
  if (input.kind !== undefined) {
    nextKind = input.kind === "auto" ? "auto" : "manual";
  }
  const sets: string[] = ["title = ?", "status = ?", "kind = ?"];
  const vals: Array<string | number> = [title, input.status, nextKind];
  if (input.conditions !== undefined) {
    const validated = validateConditions(db, input.conditions);
    if ("error" in validated) return { ok: false, error: validated.error };
    if (nextKind === "auto" && validated.conditions.length === 0) {
      return {
        ok: false,
        error: "Bộ sưu tập tự động cần ít nhất một điều kiện theo danh mục.",
      };
    }
    if (isBase) {
      const ownScale = str(existing.base_scale);
      for (const c of validated.conditions) {
        if (c.kind !== "scale" || c.operator !== "eq" || c.value === ownScale) {
          continue;
        }
        const dup = db
          .query(
            "SELECT id, title FROM collections WHERE base_scale = ? AND id != ?",
          )
          .get(c.value, input.id) as Row | null;
        if (dup) {
          return {
            ok: false,
            error: `Không lưu được: tỉ lệ ${c.value} đã có bộ sưu tập theo tỉ lệ riêng là “${str(dup.title)}”. Đổi bộ này sang tỉ lệ ${c.value} sẽ trùng với bộ đó — hãy chọn một tỉ lệ chưa có bộ theo tỉ lệ, hoặc sửa trực tiếp bộ “${str(dup.title)}”.`,
          };
        }
      }
    }
    sets.push("conditions = ?");
    vals.push(JSON.stringify(validated.conditions));
  } else if (nextKind === "auto" && currentKind !== "auto") {
    if (parseConditions(existing.conditions).length === 0) {
      return {
        ok: false,
        error: "Bộ sưu tập tự động cần ít nhất một điều kiện theo danh mục.",
      };
    }
  }
  if (input.description !== undefined) {
    sets.push("description = ?");
    vals.push(input.description.trim());
  }
  if (input.matchMode !== undefined) {
    sets.push("match_mode = ?");
    vals.push(input.matchMode === "all" ? "all" : "any");
  }
  if (input.visible !== undefined) {
    sets.push("visible_on_list = ?");
    vals.push(input.visible ? 1 : 0);
  }
  if (input.imageKey !== undefined) {
    const key = input.imageKey.trim();
    if (!validCollectionImageKey(key)) {
      return { ok: false, error: "Ảnh bộ sưu tập không hợp lệ." };
    }
    sets.push("image_key = ?");
    vals.push(key);
  }
  if (input.thumbnailConfig !== undefined) {
    sets.push("thumbnail_config = ?");
    vals.push(JSON.stringify(sanitizeThumbnailConfig(input.thumbnailConfig)));
  }
  if (input.seoTitle !== undefined) {
    sets.push("seo_title = ?");
    vals.push(input.seoTitle.trim());
  }
  if (input.seoDescription !== undefined) {
    sets.push("seo_description = ?");
    vals.push(input.seoDescription.trim());
  }
  db.query(`UPDATE collections SET ${sets.join(", ")} WHERE id = ?`).run(
    ...vals,
    input.id,
  );
  return { ok: true, error: null };
}

export function setCollectionProducts(
  db: Database,
  input: { collectionId: number; productIds: unknown },
): { ok: boolean; error: string | null } {
  ensureCollectionTables(db);
  const existing = db
    .query("SELECT id, kind FROM collections WHERE id = ?")
    .get(input.collectionId) as Row | null;
  if (!existing) return { ok: false, error: "Không tìm thấy bộ sưu tập." };
  if (str(existing.kind) === "auto") {
    return {
      ok: false,
      error: "Bộ sưu tập tự động gom sản phẩm theo điều kiện — sửa điều kiện của bộ thay vì thêm/bỏ từng sản phẩm.",
    };
  }
  const checked = checkProductIds(db, input.productIds);
  if ("error" in checked) return { ok: false, error: checked.error };
  db.query("DELETE FROM collection_products WHERE collection_id = ?").run(
    input.collectionId,
  );
  checked.ids.forEach((pid, idx) => {
    db.query(
      "INSERT OR IGNORE INTO collection_products (collection_id, product_id, position) VALUES (?, ?, ?)",
    ).run(input.collectionId, pid, idx);
  });
  return { ok: true, error: null };
}

export function deleteCollectionsBulk(db: Database, rawIds: unknown): Row {
  ensureCollectionTables(db);
  const ids = [
    ...new Set(
      (Array.isArray(rawIds) ? rawIds : [])
        .map((x) => num(x))
        .filter((x) => Number.isInteger(x) && x > 0),
    ),
  ];
  if (ids.length === 0) {
    return { ok: false, error: "Chưa chọn bộ sưu tập nào để xóa.", deleted: 0, deletedProducts: 0 };
  }
  let deleted = 0;
  db.transaction(() => {
    for (const cid of ids) {
      const rows = db
        .query("SELECT id FROM collections WHERE id = ? AND base_scale IS NULL")
        .all(cid) as Row[];
      if (rows.length === 0) continue;
      db.query("DELETE FROM collection_products WHERE collection_id = ?").run(cid);
      db.query("DELETE FROM collections WHERE id = ?").run(cid);
      deleted++;
    }
  })();
  if (deleted === 0) {
    return {
      ok: false,
      error: "Không tìm thấy bộ sưu tập tự tạo nào trong số đã chọn — 3 bộ theo tỉ lệ không được phép xóa.",
      deleted: 0,
      deletedProducts: 0,
    };
  }
  return { ok: true, error: null, deleted, deletedProducts: 0 };
}

