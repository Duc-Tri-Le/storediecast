import { z } from "./space";
import type * as schema from "./schema";

// ── Ánh xạ sản phẩm từ database sang response phía khách ────────────
// Response trả về phía khách không bao giờ chứa mã SKU hay hãng mô hình nội bộ.

export const variantOut = z.object({
  id: z.number(),
  colorName: z.string(),
  colorHex: z.string(),
  price: z.number(),
  promoPrice: z.number().nullable(),
  stock: z.number(),
  imageKey: z.string(),
});

export const productImageOut = z.object({
  imageKey: z.string(),
  variantId: z.number().nullable(),
});

export const productOut = z.object({
  id: z.number(),
  name: z.string(),
  brand: z.string(),
  scale: z.string(),
  vehicleType: z.string(),
  colorName: z.string(),
  price: z.number(),
  promoPrice: z.number().nullable(),
  stock: z.number(),
  description: z.string(),
  features: z.string(),
  imageKey: z.string(),
  isFeatured: z.boolean(),
  variants: z.array(variantOut),
  images: z.array(productImageOut),
});

export type ProductRow = typeof schema.products.$inferSelect;
export type VariantRow = typeof schema.variants.$inferSelect;

const PICKUP_NAMES = [
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

const MOTORCYCLE_NAMES = [
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

export function vehicleTypeFallback(name: string): string {
  const base = name.replace(" [MẪU]", "").replace(" [MẪU] DA LUU", "");
  if (PICKUP_NAMES.includes(base)) return "Xe bán tải";
  if (MOTORCYCLE_NAMES.includes(base)) return "Xe máy";
  return "Ô tô";
}

export function vehicleTypeOf(r: ProductRow): string {
  const fromDb = (r.loaiXe ?? "").trim();
  return fromDb !== "" ? fromDb : vehicleTypeFallback(r.name);
}

const COLOR_HEX_RULES: Array<[string, string]> = [
  ["xanh ngọc", "#0e9594"],
  ["xanh lá", "#4c9a4c"],
  ["xanh dương", "#2563eb"],
  ["xanh gp", "#2563eb"],
  ["xanh", "#2f7fd0"],
  ["đỏ", "#c8102e"],
  ["đen", "#1c1c1e"],
  ["trắng", "#f2f2f2"],
  ["bạc", "#c0c4cc"],
  ["xám", "#7d8590"],
  ["vàng", "#e8b90f"],
  ["cam", "#e8710a"],
  ["tím", "#7c3aed"],
  ["nâu", "#8a5a33"],
];

export function colorHexOf(colorName: string): string {
  const lower = colorName.toLowerCase();
  for (const [kw, hex] of COLOR_HEX_RULES) {
    if (lower.includes(kw)) return hex;
  }
  return "#9aa0a6";
}

export function toVariant(v: VariantRow): z.infer<typeof variantOut> {
  return {
    id: v.id,
    colorName: v.color,
    colorHex: colorHexOf(v.color),
    price: v.price,
    promoPrice: v.promoPrice ?? null,
    stock: v.stock,
    imageKey: v.image || "scale132",
  };
}

export function toProduct(
  r: ProductRow,
  variants: VariantRow[],
): z.infer<typeof productOut> {
  const def = variants[0];
  const images = variants.map((v) => ({
    imageKey: v.image || "scale132",
    variantId: v.id,
  }));
  return {
    id: r.id,
    name: r.name,
    brand: r.hangXe,
    scale: r.tiLe,
    vehicleType: vehicleTypeOf(r),
    colorName: def?.color ?? "",
    price: def?.price ?? 0,
    promoPrice: def?.promoPrice ?? null,
    stock: def?.stock ?? 0,
    description: r.description,
    features: r.tags || "",
    imageKey: def?.image || "scale132",
    isFeatured: r.featured === 1,
    variants: variants.map(toVariant),
    images: images,
  };
}

export function groupCatalog(
  rows: ProductRow[],
  allVariants: VariantRow[],
): Array<z.infer<typeof productOut>> {
  const vBy = new Map<number, VariantRow[]>();
  for (const v of allVariants) {
    const arr = vBy.get(v.productId) ?? [];
    arr.push(v);
    vBy.set(v.productId, arr);
  }
  return rows.map((r) => toProduct(r, vBy.get(r.id) ?? []));
}
