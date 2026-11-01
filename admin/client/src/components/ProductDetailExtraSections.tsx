import type { Product } from "../types";
import type { DraftVariant } from "../utils/productFormTypes";
import { fmtVND } from "../utils/format";
import { cardCls } from "./shared";
import { DraftThumb, renderRichText } from "./VariantImagePicker";

export function ProductDetailPreviewSection({
  product,
  name,
  brand,
  scale,
  variants,
  description,
  targetVariant,
}: {
  product: Product;
  name: string;
  brand: string;
  scale: string;
  variants: DraftVariant[];
  description: string;
  targetVariant?: DraftVariant;
}) {
  return (
    <section className={`${cardCls} p-4 mb-4 border-[var(--accent)]/40 bg-[var(--accent-soft)]/20`} aria-label="Xem trước">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Xem trước giao diện khách thấy
          </h2>
        </div>
        <span className="text-xs text-[var(--dim)] font-medium">Bản nháp dữ liệu đang nhập</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-sm">
        {targetVariant && (
          <div className="shrink-0 mx-auto sm:mx-0">
            <DraftThumb v={targetVariant} size={110} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-[var(--text)]">{name || product.name}</p>
          <p className="mt-0.5 text-xs text-[var(--dim)]">
            {brand || product.brand} · Tỉ lệ {scale || product.scale} ·{" "}
            {variants.map((v) => v.colorName).filter(Boolean).join(", ") || "Chưa có màu"}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {variants.map((v, i) => {
              const p = Number(v.price.replace(/[^\d]/g, ""));
              return p > 0 ? (
                <span
                  key={i}
                  className="rounded-md bg-[var(--sidebar)] px-2.5 py-1 text-xs font-medium text-[var(--text)]"
                >
                  {v.colorName || `Màu ${i + 1}`}:{" "}
                  <strong className="text-[var(--accent)]">{fmtVND(p)}</strong> (kho: {v.stock || 0})
                </span>
              ) : null;
            })}
          </div>

          {description && (
            <div className="mt-2.5 max-h-24 overflow-y-auto rounded-md bg-[var(--sidebar)]/40 p-2 text-xs text-[var(--dim)] leading-relaxed">
              {renderRichText(description)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ProductDetailBottomBar({
  product,
  confirmDelete,
  setConfirmDelete,
  isPendingDelete,
  onDelete,
  onBack,
  isPendingSave,
  onSubmit,
  isDirty,
}: {
  product: Product | null;
  confirmDelete: boolean;
  setConfirmDelete: (v: boolean) => void;
  isPendingDelete: boolean;
  onDelete: () => void;
  onBack: () => void;
  isPendingSave: boolean;
  onSubmit: () => void;
  isDirty?: boolean;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
      {/* Phía trái: Nút xóa */}
      <div>
        {product &&
          (confirmDelete ? (
            <div className="flex items-center gap-2 rounded-lg bg-[#fbe3e3] px-3 py-1.5 text-xs text-[#9c2b2b]">
              <span>Xóa hẳn “{product.name}”?</span>
              <button
                type="button"
                disabled={isPendingDelete}
                onClick={onDelete}
                className="rounded bg-[#c0392b] px-2.5 py-1 font-bold text-white hover:bg-[#9c2b2b] disabled:opacity-50"
              >
                Xóa ngay
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="font-medium underline hover:text-black"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[#c0392b] transition hover:bg-[#fbe3e3]"
            >
              Xóa sản phẩm
            </button>
          ))}
      </div>

      {/* Phía phải: Hủy & Lưu */}
      <div className="flex items-center gap-2 ml-auto">
        {isDirty && (
          <span className="text-xs font-medium text-[#8a5d08] bg-[#fdf0d3] px-2.5 py-1 rounded-md">
            ● Có thay đổi chưa lưu
          </span>
        )}
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--sidebar)]"
        >
          Quay lại
        </button>
        <button
          type="button"
          disabled={isPendingSave}
          onClick={onSubmit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--accent-dark)] disabled:opacity-50"
        >
          {isPendingSave ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Đang lưu…</span>
            </>
          ) : (
            <span>{product ? "Lưu thay đổi" : "Tạo sản phẩm"}</span>
          )}
        </button>
      </div>
    </div>
  );
}
