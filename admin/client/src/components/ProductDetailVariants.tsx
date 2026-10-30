import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import type { DraftVariant } from "../utils/productFormTypes";
import { cardCls, inputCls, labelCls } from "./shared";
import { DraftThumb, VariantImagePicker } from "./VariantImagePicker";

export function ProductDetailVariantsSection({
  variants,
  setVariant,
  onAddVariant,
  onRemoveVariant,
  dragVariantFrom,
  dragVariantTarget,
  variantCardsRef,
  onVariantHandleDown,
  onVariantHandleMove,
  endVariantDrag,
  reorderVariant,
  openPicker,
  imageKeys,
  setNotice,
}: {
  variants: DraftVariant[];
  setVariant: (i: number, patch: Partial<DraftVariant>) => void;
  onAddVariant: () => void;
  onRemoveVariant: (i: number) => void;
  dragVariantFrom: number | null;
  dragVariantTarget: number | null;
  variantCardsRef: RefObject<(HTMLDivElement | null)[]>;
  onVariantHandleDown: (e: ReactPointerEvent<HTMLButtonElement>, i: number) => void;
  onVariantHandleMove: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  endVariantDrag: (apply: boolean) => void;
  reorderVariant: (from: number, to: number) => void;
  openPicker: number | null;
  imageKeys: string[];
  setNotice: (msg: string) => void;
}) {
  return (
    <>
      <section className={cardCls} aria-label="Tùy chọn biến thể">
        <h2 className="text-sm font-bold">Tùy chọn biến thể</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Màu</span>
          <span className="flex flex-wrap gap-1.5">
            {variants.map((v, i) => (
              <span key={i} className="rounded-full bg-[var(--sidebar)] px-2.5 py-0.5 text-sm">
                {v.colorName || `Màu ${i + 1}`}
              </span>
            ))}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() =>
              setNotice("Shop chỉ có một tùy chọn biến thể là Màu — đổi tên màu ngay trong bảng Biến thể bên dưới.")
            }
            className="text-sm font-medium text-[var(--accent)]"
          >
            Sửa tùy chọn
          </button>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked readOnly className="h-4 w-4" />
          Nhóm biến thể theo tùy chọn này:
          <select
            aria-label="Nhóm biến thể theo"
            className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-sm"
            value="Màu"
            onChange={() => setNotice("Biến thể của shop chỉ nhóm theo Màu.")}
          >
            <option value="Màu">Màu</option>
          </select>
        </label>
      </section>

      <section className={cardCls} aria-label="Biến thể">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="mr-auto text-sm font-bold">Biến thể ({variants.length})</h2>
          <button
            type="button"
            onClick={() =>
              setNotice("Shop chỉ có một tùy chọn biến thể là Màu — đổi tên màu ngay trong bảng này.")
            }
            className="text-sm font-medium text-[var(--accent)]"
          >
            Sửa tùy chọn
          </button>
          <button
            type="button"
            onClick={onAddVariant}
            className="text-sm font-medium text-[var(--accent)]"
          >
            Thêm biến thể
          </button>
        </div>
        <p className="mt-1 text-xs tracking-wide text-[var(--dim)] uppercase">
          Nhóm: Màu — màu đầu tiên là màu mặc định trên web khách
        </p>
        <div className="mt-2 space-y-3">
          {variants.map((v, i) => (
            <div
              key={i}
              ref={(el) => {
                if (variantCardsRef.current) variantCardsRef.current[i] = el;
              }}
              data-variant-card={i}
              className={`rounded-xl border shadow-[var(--shadow-card)] p-3 ${
                dragVariantFrom === i
                  ? "border-[var(--accent)] opacity-70"
                  : dragVariantTarget === i && dragVariantFrom !== null
                    ? "border-[var(--accent)]"
                    : "border-[var(--border)]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label={`Kéo để đổi vị trí màu ${i + 1}`}
                  title="Bấm giữ và kéo để đổi vị trí"
                  onPointerDown={(e) => onVariantHandleDown(e, i)}
                  onPointerMove={onVariantHandleMove}
                  onPointerUp={() => endVariantDrag(true)}
                  onPointerCancel={() => endVariantDrag(false)}
                  onKeyDown={(e: ReactKeyboardEvent<HTMLButtonElement>) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      reorderVariant(i, i - 1);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      reorderVariant(i, i + 1);
                    }
                  }}
                  className="flex h-10 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-[var(--dim)] hover:bg-[var(--border)]/40 active:cursor-grabbing"
                >
                  <svg
                    width="12"
                    height="20"
                    viewBox="0 0 12 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <circle cx="3" cy="3" r="1.6" />
                    <circle cx="9" cy="3" r="1.6" />
                    <circle cx="3" cy="10" r="1.6" />
                    <circle cx="9" cy="10" r="1.6" />
                    <circle cx="3" cy="17" r="1.6" />
                    <circle cx="9" cy="17" r="1.6" />
                  </svg>
                </button>
                <DraftThumb v={v} />
                <div className="min-w-40 flex-1">
                  <label className={labelCls} htmlFor={`pd-color-${i}`}>
                    Màu {i + 1}
                    {i === 0 ? " (mặc định)" : ""}
                  </label>
                  <input
                    id={`pd-color-${i}`}
                    className={inputCls}
                    value={v.colorName}
                    onChange={(e) => setVariant(i, { colorName: e.target.value })}
                    placeholder="Đỏ"
                  />
                </div>
                <span className="font-mono text-xs text-[var(--dim)]">
                  SKU: {v.sku ?? "tự sinh khi lưu"}
                </span>
                {variants.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Bỏ màu ${i + 1}`}
                    onClick={() => onRemoveVariant(i)}
                    className="rounded-lg border border-[#e3b3b3] px-2.5 py-1.5 text-sm text-[#9c2b2b]"
                  >
                    Bỏ màu
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <label className={labelCls} htmlFor={`pd-stock-${i}`}>
                    Tồn kho
                  </label>
                  <input
                    id={`pd-stock-${i}`}
                    className={inputCls}
                    inputMode="numeric"
                    value={v.stock}
                    onChange={(e) => setVariant(i, { stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`pd-price-${i}`}>
                    Giá (₫)
                  </label>
                  <input
                    id={`pd-price-${i}`}
                    className={inputCls}
                    inputMode="numeric"
                    value={v.price}
                    onChange={(e) => setVariant(i, { price: e.target.value })}
                    placeholder="499000"
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`pd-promo-${i}`}>
                    Giá khuyến mãi (₫)
                  </label>
                  <input
                    id={`pd-promo-${i}`}
                    className={inputCls}
                    inputMode="numeric"
                    value={v.promoPrice}
                    onChange={(e) => setVariant(i, { promoPrice: e.target.value })}
                    placeholder="Trống = không KM"
                  />
                </div>
              </div>
              {openPicker === i && (
                <div className="mt-2">
                  <VariantImagePicker
                    v={v}
                    imageKeys={imageKeys}
                    idPrefix={`pd-img-${i}`}
                    onChange={(patch) => setVariant(i, patch)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
