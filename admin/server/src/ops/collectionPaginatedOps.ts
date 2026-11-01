import { Database } from "bun:sqlite";
import { type Row, iso, nullableStr, num, str } from "./dbCommon";
import { ensureCollectionTables } from "./catalogInit";
import { parseConditions, parseThumbnailConfig } from "./collectionHelpers";
import { slugify } from "../slug";

export interface CollectionPaginatedOptions {
  page?: number;
  pageSize?: number;
  tab?: "all" | "manual" | "auto";
  search?: string;
  sort?: "default" | "titleAsc" | "titleDesc" | "newest";
}

export function listCollectionsPaginated(db: Database, options: CollectionPaginatedOptions = {}): Row {
  ensureCollectionTables(db);

  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.max(1, Math.min(200, Number(options.pageSize) || 50));
  const baseConds: string[] = [];
  const baseParams: any[] = [];

  if (options.search && options.search.trim()) {
    const pat = "%" + options.search.trim() + "%";
    baseConds.push("(title LIKE ? OR description LIKE ?)");
    baseParams.push(pat, pat);
  }

  const baseWhereSql = baseConds.length > 0 ? " WHERE " + baseConds.join(" AND ") : "";

  const counts = {
    all: (db.query(`SELECT COUNT(*) as c FROM collections${baseWhereSql}`).get(...baseParams) as { c: number }).c,
    manual: (db.query(`SELECT COUNT(*) as c FROM collections ${baseConds.length > 0 ? " WHERE " + baseConds.join(" AND ") + " AND kind = 'manual'" : " WHERE kind = 'manual'"}`).get(...baseParams) as { c: number }).c,
    auto: (db.query(`SELECT COUNT(*) as c FROM collections ${baseConds.length > 0 ? " WHERE " + baseConds.join(" AND ") + " AND kind = 'auto'" : " WHERE kind = 'auto'"}`).get(...baseParams) as { c: number }).c,
  };

  const fullConds = [...baseConds];
  const fullParams = [...baseParams];

  if (options.tab === "manual") {
    fullConds.push("kind = 'manual'");
  } else if (options.tab === "auto") {
    fullConds.push("kind = 'auto'");
  }

  const fullWhereSql = fullConds.length > 0 ? " WHERE " + fullConds.join(" AND ") : "";
  const total = (db.query(`SELECT COUNT(*) as c FROM collections${fullWhereSql}`).get(...fullParams) as { c: number }).c;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  let sortSql = "ORDER BY created_at DESC, id DESC";
  switch (options.sort) {
    case "titleAsc":
      sortSql = "ORDER BY title COLLATE NOCASE ASC";
      break;
    case "titleDesc":
      sortSql = "ORDER BY title COLLATE NOCASE DESC";
      break;
    default:
      sortSql = "ORDER BY created_at DESC, id DESC";
      break;
  }

  const cols = db.query(`SELECT * FROM collections${fullWhereSql} ${sortSql} LIMIT ? OFFSET ?`).all(...fullParams, pageSize, offset) as Row[];
  const colIds = cols.map((c) => num(c.id));
  const byCol = new Map<number, number[]>();
  if (colIds.length > 0) {
    const ph = colIds.map(() => "?").join(",");
    const links = db
      .query(`SELECT collection_id, product_id FROM collection_products WHERE collection_id IN (${ph}) ORDER BY position ASC, product_id ASC`)
      .all(...colIds) as Row[];
    for (const l of links) {
      const cid = num(l.collection_id);
      const arr = byCol.get(cid) ?? [];
      arr.push(num(l.product_id));
      byCol.set(cid, arr);
    }
  }

  const collections = cols.map((c) => ({
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
    slug: str(c.slug ?? "") || slugify(str(c.title)),
    baseScale: nullableStr(c.base_scale),
    productIds: byCol.get(num(c.id)) ?? [],
    createdAt: iso(c.created_at),
  }));

  return {
    collections,
    total,
    page: safePage,
    pageSize,
    totalPages,
    counts,
  };
}

