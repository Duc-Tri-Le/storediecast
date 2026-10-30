import type { Product } from "../types";
import { resolveProductImage } from "../data/maps";

export function ProductGallery({
  product,
  mainImageKey,
  gallery,
  colorName,
  discount,
  out,
  onSelectImage,
}: {
  product: Product;
  mainImageKey: string | null;
  gallery: Array<{ imageKey: string; variantId?: number | null }>;
  colorName: string;
  discount: number;
  out: boolean;
  onSelectImage: (key: string) => void;
}) {
  const mainImage = gallery.find((im) => im.imageKey === mainImageKey) ?? gallery[0];

  return (
    <div className="self-start">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <img
          src={resolveProductImage(mainImage?.imageKey ?? product.imageKey)}
          alt={`Mô hình ${product.name} màu ${colorName} tỉ lệ ${product.scale}`}
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-white">
          Tỉ lệ {product.scale}
        </span>
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--promo)] px-3 py-1 text-xs font-bold text-white">
            Giảm {discount}%
          </span>
        )}
        {out && (
          <span className="absolute inset-x-0 bottom-0 bg-black/70 py-2 text-center text-sm font-bold text-white">
            HẾT HÀNG
          </span>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Ảnh của sản phẩm">
          {gallery.map((im, idx) => {
            const active = mainImage?.imageKey === im.imageKey;
            const imVariant =
              im.variantId != null
                ? product.variants.find((v) => v.id === im.variantId)
                : null;
            return (
              <button
                key={`${im.imageKey}-${idx}`}
                type="button"
                onClick={() => onSelectImage(im.imageKey)}
                aria-pressed={active}
                aria-label={
                  imVariant
                    ? `Xem ảnh màu ${imVariant.colorName} của ${product.name}`
                    : `Xem ảnh chung của ${product.name}`
                }
                className={`shrink-0 overflow-hidden rounded-xl border-2 ${
                  active ? "border-[var(--accent)]" : "border-[var(--border)]"
                }`}
              >
                <img
                  src={resolveProductImage(im.imageKey)}
                  alt=""
                  className="h-16 w-20 object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

