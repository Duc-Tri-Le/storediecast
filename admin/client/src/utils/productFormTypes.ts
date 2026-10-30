import type { Product, Variant } from "../types";

export type ImageMode = "link" | "upload" | "catalog";
export type LinkState = "idle" | "checking" | "ok" | "error";

export type DraftVariant = {
  id: number | null;
  colorName: string;
  price: string;
  promoPrice: string;
  stock: string;
  sku: string | null;
  imageMode: ImageMode;
  catalogKey: string;
  linkUrl: string;
  linkState: LinkState;
  uploadDataUrl: string;
  uploadName: string;
  uploadError: string | null;
};

export type PersistedVariantShape = {
  id: number | null;
  colorName: string;
  price: string;
  promoPrice: string;
  stock: string;
  sku: string | null;
  imageKey: string;
};

export type ProductFormShape = {
  name: string;
  brand: string;
  scale: string;
  modelMaker: string;
  vehicleType: string;
  isFeatured: boolean;
  description: string;
  tags: string[];
  variants: PersistedVariantShape[];
};

export function draftFromVariant(v: Variant): DraftVariant {
  const base: DraftVariant = {
    id: v.id,
    colorName: v.colorName,
    price: String(v.price),
    promoPrice: v.promoPrice != null ? String(v.promoPrice) : "",
    stock: String(v.stock),
    sku: v.sku,
    imageMode: "catalog",
    catalogKey: v.imageKey,
    linkUrl: "",
    linkState: "idle",
    uploadDataUrl: "",
    uploadName: "",
    uploadError: null,
  };
  if (/^https?:\/\//i.test(v.imageKey)) {
    return { ...base, imageMode: "link", linkUrl: v.imageKey, linkState: "ok" };
  }
  if (/^data:image\//i.test(v.imageKey)) {
    return { ...base, imageMode: "upload", uploadDataUrl: v.imageKey, uploadName: "Ảnh đã tải lên" };
  }
  return base;
}

export function emptyDraftVariant(): DraftVariant {
  return {
    id: null,
    colorName: "",
    price: "",
    promoPrice: "",
    stock: "0",
    sku: null,
    imageMode: "link",
    catalogKey: "scale132",
    linkUrl: "",
    linkState: "idle",
    uploadDataUrl: "",
    uploadName: "",
    uploadError: null,
  };
}

export function effectiveImageKey(v: DraftVariant | AddVariant): string {
  if (v.imageMode === "link") return v.linkUrl.trim();
  if (v.imageMode === "upload") return v.uploadDataUrl;
  return v.catalogKey;
}

export function normalizeNumStr(s: string, emptyAsZero = false): string {
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return emptyAsZero ? "0" : "";
  return digits.replace(/^0+(?=\d)/, "");
}

export function persistedVariantFromDraft(v: DraftVariant): PersistedVariantShape {
  return {
    id: v.id,
    colorName: v.colorName.trim(),
    price: normalizeNumStr(v.price),
    promoPrice: normalizeNumStr(v.promoPrice),
    stock: normalizeNumStr(v.stock, true),
    sku: v.sku,
    imageKey: effectiveImageKey(v),
  };
}

export function persistedVariantFromProductVariant(v: Variant): PersistedVariantShape {
  return {
    id: v.id,
    colorName: v.colorName.trim(),
    price: String(v.price),
    promoPrice: v.promoPrice != null ? String(v.promoPrice) : "",
    stock: String(v.stock),
    sku: v.sku,
    imageKey: v.imageKey,
  };
}

export function productShapeFromProduct(p: Product): ProductFormShape {
  return {
    name: p.name.trim(),
    brand: p.brand,
    scale: p.scale,
    modelMaker: p.modelMaker ?? "",
    vehicleType: p.vehicleType ?? "",
    isFeatured: p.isFeatured,
    description: (p.description ?? "").trim(),
    tags: (p.features ?? "")
      .split("·")
      .map((t) => t.trim())
      .filter(Boolean),
    variants: [...p.variants]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(persistedVariantFromProductVariant),
  };
}

export function draftVariantFromPersisted(sv: PersistedVariantShape): DraftVariant {
  const base: DraftVariant = {
    id: sv.id,
    colorName: sv.colorName,
    price: sv.price,
    promoPrice: sv.promoPrice,
    stock: sv.stock,
    sku: sv.sku,
    imageMode: "catalog",
    catalogKey: sv.imageKey || "scale132",
    linkUrl: "",
    linkState: "idle",
    uploadDataUrl: "",
    uploadName: "",
    uploadError: null,
  };
  if (/^https?:\/\//i.test(sv.imageKey)) {
    return { ...base, imageMode: "link", linkUrl: sv.imageKey, linkState: "ok" };
  }
  if (/^data:image\//i.test(sv.imageKey)) {
    return {
      ...base,
      imageMode: "upload",
      uploadDataUrl: sv.imageKey,
      uploadName: "Ảnh đã tải lên",
    };
  }
  return base;
}

export async function processImageFile(
  file: File,
): Promise<{ dataUrl: string } | { error: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "File không phải ảnh — chỉ chọn file ảnh (JPG, PNG, WebP, GIF…)." };
  }
  if (file.size > 12 * 1024 * 1024) {
    return { error: "Ảnh lớn hơn 12MB — chọn ảnh nhỏ hơn." };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("bad image"));
      im.src = url;
    });
    const render = (maxDim: number, q: number): string => {
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const cx = canvas.getContext("2d");
      if (!cx) return "";
      cx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", q);
    };
    let dataUrl = render(1024, 0.85);
    if (dataUrl.length > 1400000) dataUrl = render(800, 0.7);
    if (!dataUrl || dataUrl.length > 1400000) {
      return { error: "Ảnh vẫn quá lớn sau khi nén — chọn ảnh nhỏ hơn." };
    }
    return { dataUrl };
  } catch {
    return { error: "Không đọc được file ảnh này — thử file khác." };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type AddVariant = {
  colorName: string;
  sellPrice: string;
  compareAt: string;
  costPrice: string;
  stock: string;
  barcode: string;
  variantTag: string;
  imageMode: ImageMode;
  catalogKey: string;
  linkUrl: string;
  linkState: LinkState;
  uploadDataUrl: string;
  uploadName: string;
  uploadError: string | null;
};

export function emptyAddVariant(): AddVariant {
  return {
    colorName: "",
    sellPrice: "",
    compareAt: "",
    costPrice: "",
    stock: "0",
    barcode: "",
    variantTag: "",
    imageMode: "link",
    catalogKey: "scale132",
    linkUrl: "",
    linkState: "idle",
    uploadDataUrl: "",
    uploadName: "",
    uploadError: null,
  };
}

export function addVariantImageShape(v: AddVariant): DraftVariant {
  return {
    id: null,
    colorName: v.colorName,
    price: v.sellPrice,
    promoPrice: "",
    stock: v.stock,
    sku: null,
    imageMode: v.imageMode,
    catalogKey: v.catalogKey,
    linkUrl: v.linkUrl,
    linkState: v.linkState,
    uploadDataUrl: v.uploadDataUrl,
    uploadName: v.uploadName,
    uploadError: v.uploadError,
  };
}
