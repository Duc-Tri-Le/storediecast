import { defineAction, z } from "./space";
import { and, asc, desc, eq, inArray, like, or, type SQL } from "drizzle-orm";
import * as schema from "./schema";
import { groupCatalog, productOut, vehicleTypeOf } from "./catalog";

// ── Danh sách sản phẩm: LỌC + PHÂN TRANG Ở SERVER ───────────────────
const listProductsRequest = z.object({
  scale: z.string().default("all"),
  search: z.string().default(""),
  vehicleType: z.string().default("all"),
  brand: z.string().default("all"),
  priceMin: z.number().int().min(0).nullable().default(null),
  priceMax: z.number().int().min(0).nullable().default(null),
  sort: z.enum(["featured", "az", "za", "priceAsc", "priceDesc"]).default("featured"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(200).default(200),
});

const listProductsResponse = z.object({
  products: z.array(productOut),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

type ListProductsArgs = z.infer<typeof listProductsRequest>;
type ListProductsResult = z.infer<typeof listProductsResponse>;

export const listProducts = defineAction({
  request: listProductsRequest,
  response: listProductsResponse,
  async handler(ctx, args: ListProductsArgs): Promise<ListProductsResult> {
    const db = ctx.db;
    const conds: SQL[] = [];
    if (args.scale !== "all") conds.push(eq(schema.products.tiLe, args.scale));
    if (args.brand !== "all") conds.push(eq(schema.products.hangXe, args.brand));
    const q = args.search.trim();
    if (q !== "") {
      const pat = `%${q}%`;
      const s = or(
        like(schema.products.name, pat),
        like(schema.products.hangXe, pat),
        like(schema.products.loaiXe, pat),
      );
      if (s) conds.push(s);
    }
    const where = conds.length > 0 ? and(...conds) : undefined;
    let rows = await db
      .select()
      .from(schema.products)
      .where(where)
      .orderBy(asc(schema.products.tiLe), desc(schema.products.featured), asc(schema.products.id));
    if (args.vehicleType !== "all") {
      let vt = args.vehicleType;
      if (vt === "oto" || vt === "car") vt = "Ô tô";
      else if (vt === "xemay" || vt === "moto") vt = "Xe máy";
      else if (vt === "bantai" || vt === "pickup") vt = "Xe bán tải";
      else if (vt === "maybay" || vt === "plane") vt = "Máy bay";
      rows = rows.filter((r: any) => {
        const rowType = vehicleTypeOf(r);
        return (
          rowType === vt ||
          rowType === args.vehicleType ||
          (r.loaiXe && r.loaiXe.trim().toLowerCase() === vt.trim().toLowerCase())
        );
      });
    }
    const ids = rows.map((r: any) => r.id);
    const allVariants = ids.length
      ? await db
          .select()
          .from(schema.variants)
          .where(inArray(schema.variants.productId, ids))
          .orderBy(asc(schema.variants.position), asc(schema.variants.id))
      : [];
    let products = groupCatalog(rows, allVariants);
    if (args.priceMin != null || args.priceMax != null) {
      products = products.filter((p) =>
        p.variants.some((v) => {
          const eff = v.promoPrice != null && v.promoPrice > 0 ? v.promoPrice : v.price;
          if (args.priceMin != null && eff < args.priceMin) return false;
          if (args.priceMax != null && eff >= args.priceMax) return false;
          return true;
        }),
      );
    }
    const effPrice = (p: (typeof products)[number]) =>
      p.promoPrice != null && p.promoPrice > 0 ? p.promoPrice : p.price;
    switch (args.sort) {
      case "az":
        products.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        break;
      case "za":
        products.sort((a, b) => b.name.localeCompare(a.name, "vi"));
        break;
      case "priceAsc":
        products.sort((a, b) => effPrice(a) - effPrice(b) || a.name.localeCompare(b.name, "vi"));
        break;
      case "priceDesc":
        products.sort((a, b) => effPrice(b) - effPrice(a) || a.name.localeCompare(b.name, "vi"));
        break;
      default:
        products.sort(
          (a, b) =>
            Number(b.isFeatured) - Number(a.isFeatured) || a.name.localeCompare(b.name, "vi"),
        );
    }
    const pageSize = args.pageSize || 200;
    const pageNum = args.page || 1;
    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(pageNum, totalPages);
    const start = (page - 1) * pageSize;
    return {
      products: products.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages,
    };
  },
});
