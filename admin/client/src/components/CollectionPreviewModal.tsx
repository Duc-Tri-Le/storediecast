import type { Product } from "../types";
import type { CollectionNav } from "../utils/collectionRules";
import { fmtVND, colorHex, directImageSrc, defaultVariant } from "../utils/format";
import { renderRichText } from "./VariantImagePicker";

export function CollectionPreviewModal({
  title,
  imageKey,
  description,
  displayedProducts,
  visibleOnList,
  rowNav,
  onViewNav,
  onClose,
}: {
  title: string;
  imageKey: string;
  description: string;
  displayedProducts: Product[];
  visibleOnList: boolean;
  rowNav: CollectionNav | null;
  onViewNav: (nav: CollectionNav) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Xem trước bộ sưu tập ${title}`}
    >
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)]">
        <div className="flex items-start gap-2">
          <h2 className="mr-auto text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng xem trước"
            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-sm"
          >
            Đóng
          </button>
        </div>
        {directImageSrc(imageKey) && (
          <img
            src={directImageSrc(imageKey) ?? undefined}
            alt={`Ảnh bộ sưu tập ${title}`}
            className="mt-3 max-h-56 w-full rounded-lg object-cover"
          />
        )}
        {description.trim() && (
          <div className="mt-3 text-sm">{renderRichText(description)}</div>
        )}
        <p className="mt-3 text-sm text-[var(--dim)]">
          {displayedProducts.length} sản phẩm ·{" "}
          {visibleOnList
            ? "Đang hiện trên trang Bộ sưu tập của web khách"
            : "Đang ẩn khỏi trang Bộ sưu tập của web khách"}
        </p>
        {displayedProducts.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--dim)]">Bộ này chưa có sản phẩm nào.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {displayedProducts.map((p) => {
              const v = defaultVariant(p);
              const src = v ? directImageSrc(v.imageKey) : null;
              return (
                <li key={p.id} className="rounded-lg border border-[var(--border)] p-2">
                  {src ? (
                    <img
                      src={src}
                      alt={`Ảnh ${p.name}`}
                      loading="lazy"
                      className="h-24 w-full rounded-md object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-24 w-full items-center justify-center rounded-md border border-[var(--border)]"
                      style={{
                        background: `linear-gradient(135deg, ${colorHex(v?.colorName ?? "")}33, ${colorHex(v?.colorName ?? "")}11)`,
                      }}
                    >
                      <span
                        className="block h-8 w-8 rounded-full border border-black/10"
                        style={{ background: colorHex(v?.colorName ?? "") }}
                      />
                    </span>
                  )}
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium">{p.name}</p>
                  <p className="text-sm font-semibold text-[var(--accent-dark)]">
                    {fmtVND(v?.promoPrice ?? v?.price ?? 0)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {rowNav && (
          <button
            type="button"
            onClick={() => onViewNav(rowNav)}
            className="mt-4 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
          >
            Xem trong trang Sản phẩm
          </button>
        )}
      </div>
    </div>
  );
}

