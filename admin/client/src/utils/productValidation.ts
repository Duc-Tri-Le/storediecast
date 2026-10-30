import type { ProductInput } from "../types";
import type { DraftVariant } from "./productFormTypes";
import { effectiveImageKey } from "./productFormTypes";

export function validateProductDraft({
  name,
  brand,
  scale,
  vehicleType,
  description,
  tags,
  isFeatured,
  modelMaker,
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
  variants: DraftVariant[];
  productId: number | null;
}): { ok: true; input: ProductInput } | { ok: false; error: string } {
  if (name.trim().length < 2) return { ok: false, error: "Tiêu đề sản phẩm cần ít nhất 2 ký tự." };
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
    const price = Number(v.price.replace(/[^\d]/g, ""));
    const promo = v.promoPrice ? Number(v.promoPrice.replace(/[^\d]/g, "")) : null;
    const stock = Number(v.stock.replace(/[^\d]/g, "") || "0");
    if (!v.colorName.trim()) return { ok: false, error: `Màu ${i + 1}: thiếu tên màu.` };
    if (!price || price <= 0) return { ok: false, error: `Màu ${i + 1}: giá gốc phải lớn hơn 0.` };
    if (promo != null && promo >= price) {
      return { ok: false, error: `Màu ${i + 1}: giá khuyến mãi phải nhỏ hơn giá gốc.` };
    }
    if (v.imageMode === "link") {
      if (!v.linkUrl.trim()) return { ok: false, error: `Màu ${i + 1}: chưa dán link ảnh.` };
      if (v.linkState === "checking") {
        return {
          ok: false,
          error: `Màu ${i + 1}: đang kiểm tra link ảnh — chờ ảnh xem trước tải xong rồi lưu.`,
        };
      }
      if (v.linkState !== "ok") {
        return {
          ok: false,
          error: `Màu ${i + 1}: link ảnh chưa hợp lệ hoặc không tải được — sửa link rồi mới lưu được.`,
        };
      }
    }
    if (v.imageMode === "upload" && !v.uploadDataUrl) {
      return { ok: false, error: `Màu ${i + 1}: chưa chọn ảnh từ máy.` };
    }
    if (v.imageMode === "upload" && v.uploadError) {
      return { ok: false, error: `Màu ${i + 1}: ${v.uploadError}` };
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
  return {
    id: null,
    name: `Bản sao của ${name.trim()}`,
    brand,
    scale,
    modelMaker,
    vehicleType,
    description,
    features: tags.join(" · "),
    isFeatured: false,
    variants: variants.map((v) => {
      const p = Number(v.price.replace(/[^\d]/g, "") || "0");
      const promo = v.promoPrice ? Number(v.promoPrice.replace(/[^\d]/g, "") || "0") : null;
      const s = Number(v.stock.replace(/[^\d]/g, "") || "0");
      return {
        id: null,
        colorName: v.colorName.trim() || "Màu",
        price: p,
        promoPrice: promo && promo > 0 ? promo : null,
        stock: s,
        imageKey: effectiveImageKey(v) || "scale132",
      };
    }),
  };
}

