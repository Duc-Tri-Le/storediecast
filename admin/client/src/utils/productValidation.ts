import { slugify } from "./slug";
import type { ProductInput } from "../types";
import type { DraftVariant } from "./productFormTypes";
import { effectiveImageKey } from "./productFormTypes";

/** Kiểm tra hợp lệ thời gian thực cho Tên sản phẩm */
export function getProductNameError(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return "Vui lòng nhập tên sản phẩm";
  if (trimmed.length < 2) return "Tên sản phẩm cần ít nhất 2 ký tự";
  return null;
}

/** Kiểm tra hợp lệ thời gian thực cho Tên màu biến thể */
export function getColorNameError(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return "Vui lòng nhập tên màu";
  return null;
}

/** Kiểm tra hợp lệ thời gian thực cho Giá niêm yết / Giá bán: Phải là số có ít nhất 5 chữ số (>= 10.000) */
export function getPriceError(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return "Vui lòng nhập giá bán";
  const digitsOnly = trimmed.replace(/[.,\s]/g, "");
  if (!/^\d+$/.test(digitsOnly)) return "Giá bán phải là số";
  const num = Number(digitsOnly);
  if (digitsOnly.length < 5 || num < 10000) return "Cần ít nhất 5 chữ số (≥ 10.000₫)";
  return null;
}

/** Kiểm tra hợp lệ thời gian thực cho Giá khuyến mãi: Tùy chọn, nếu nhập phải là số có ít nhất 5 chữ số và nhỏ hơn giá bán */
export function getPromoPriceError(promoVal: string, listPriceVal: string): string | null {
  const trimmed = promoVal.trim();
  if (!trimmed) return null;
  const digitsOnly = trimmed.replace(/[.,\s]/g, "");
  if (!/^\d+$/.test(digitsOnly)) return "Giá KM phải là số";
  const promo = Number(digitsOnly);
  if (digitsOnly.length < 5 || promo < 10000) return "Cần ít nhất 5 chữ số (≥ 10.000₫)";
  const listDigits = listPriceVal.trim().replace(/[.,\s]/g, "");
  if (/^\d+$/.test(listDigits)) {
    const listPrice = Number(listDigits);
    if (listPrice > 0 && promo >= listPrice) return "Giá KM phải nhỏ hơn giá bán";
  }
  return null;
}

/** Kiểm tra hợp lệ thời gian thực cho Số lượng tồn kho: Phải là số nguyên không âm */
export function getStockError(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return "Vui lòng nhập số lượng";
  if (!/^\d+$/.test(trimmed)) return "Tồn kho phải là số nguyên ≥ 0";
  return null;
}

export function validateProductDraft({
  name,
  brand,
  scale,
  vehicleType,
  description,
  tags,
  isFeatured,
  modelMaker,
  slug,
  seoTitle,
  seoDescription,
  variants,
  productId,
}: {
  name: string;
  brand: string;
  scale: string;
  vehicleType: string;
  description: string;
  tags: string[];
  isFeatured: boolean;
  modelMaker: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  variants: DraftVariant[];
  productId: number | null;
}): { ok: true; input: ProductInput } | { ok: false; error: string } {
  const nameErr = getProductNameError(name);
  if (nameErr) return { ok: false, error: nameErr };
  if (!brand.trim()) return { ok: false, error: "Chưa chọn hãng xe." };
  if (!scale.trim()) return { ok: false, error: "Chưa chọn tỉ lệ." };
  if (variants.length === 0) return { ok: false, error: "Cần ít nhất một biến thể màu." };

  const parsed: Array<{
    id: number | null;
    colorName: string;
    price: number;
    promoPrice: number | null;
    stock: number;
    imageKey: string;
  }> = [];

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i]!;
    const label = `Màu ${i + 1}${v.colorName ? ` (${v.colorName})` : ""}`;

    const colorErr = getColorNameError(v.colorName);
    if (colorErr) return { ok: false, error: `${label}: ${colorErr.toLowerCase()}.` };

    const priceErr = getPriceError(v.price);
    if (priceErr) return { ok: false, error: `${label}: ${priceErr.toLowerCase()}.` };

    const promoErr = getPromoPriceError(v.promoPrice, v.price);
    if (promoErr) return { ok: false, error: `${label}: ${promoErr.toLowerCase()}.` };

    const stockErr = getStockError(v.stock);
    if (stockErr) return { ok: false, error: `${label}: ${stockErr.toLowerCase()}.` };

    const price = Number(v.price.replace(/[^\d]/g, ""));
    const promo = v.promoPrice.trim() ? Number(v.promoPrice.replace(/[^\d]/g, "")) : null;
    const stock = Number(v.stock.replace(/[^\d]/g, "") || "0");

    if (v.imageMode === "link") {
      if (!v.linkUrl.trim()) return { ok: false, error: `${label}: chưa dán link ảnh.` };
      if (v.linkState === "checking") {
        return {
          ok: false,
          error: `${label}: đang kiểm tra link ảnh — chờ ảnh xem trước tải xong rồi lưu.`,
        };
      }
      if (v.linkState !== "ok") {
        return {
          ok: false,
          error: `${label}: link ảnh chưa hợp lệ hoặc không tải được — sửa link rồi mới lưu được.`,
        };
      }
    }
    if (v.imageMode === "upload" && !v.uploadDataUrl) {
      return { ok: false, error: `${label}: chưa chọn ảnh từ máy.` };
    }
    if (v.imageMode === "upload" && v.uploadError) {
      return { ok: false, error: `${label}: ${v.uploadError}` };
    }
    parsed.push({
      id: v.id,
      colorName: v.colorName.trim(),
      price,
      promoPrice: promo,
      stock,
      imageKey: effectiveImageKey(v) || "scale132",
    });
  }

  return {
    ok: true,
    input: {
      id: productId,
      name: name.trim(),
      brand,
      scale,
      vehicleType,
      description: description.trim(),
      features: tags.join(" · "),
      isFeatured,
      modelMaker,
      slug: (slug?.trim() || slugify(name.trim())) || undefined,
      seoTitle: seoTitle?.trim() || undefined,
      seoDescription: seoDescription?.trim() || undefined,
      variants: parsed,
    },
  };
}

export function buildDuplicateProductInput({
  name,
  brand,
  scale,
  modelMaker,
  vehicleType,
  description,
  tags,
  variants,
}: {
  name: string;
  brand: string;
  scale: string;
  modelMaker: string;
  vehicleType: string;
  description: string;
  tags: string[];
  variants: DraftVariant[];
}): ProductInput {
  const baseName = name.trim().replace(/^Bản sao của\s+/i, "");
  return {
    id: null,
    name: `Bản sao của ${baseName}`,
    brand,
    scale,
    modelMaker,
    vehicleType,
    description,
    features: tags.join(" · "),
    isFeatured: false,
    variants: variants.map((v, i) => {
      const price = Number(v.price.replace(/[^\d]/g, "")) || 499000;
      const promo = v.promoPrice.trim() ? Number(v.promoPrice.replace(/[^\d]/g, "")) : null;
      const stock = Number(v.stock.replace(/[^\d]/g, "") || "0");
      return {
        id: null,
        colorName: v.colorName.trim() || `Màu ${i + 1}`,
        price,
        promoPrice: promo != null && promo < price ? promo : null,
        stock,
        imageKey: effectiveImageKey(v) || "scale132",
      };
    }),
  };
}
