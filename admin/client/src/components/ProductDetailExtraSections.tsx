import type { Product } from "../types";
import type { DraftVariant } from "../utils/productFormTypes";
import { fmtVND } from "../utils/format";
import { cardCls, inputCls, labelCls, smallBtn } from "./shared";
import { DraftThumb, renderRichText } from "./VariantImagePicker";
import type { RefObject } from "react";

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
    <section className={`${cardCls} mt-4`} aria-label="Xem trước như khách thấy">
      <h2 className="text-sm font-bold">Xem trước như khách thấy (dữ liệu đang nhập)</h2>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        {targetVariant && <DraftThumb v={targetVariant} size={120} />}
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold">{name || product.name}</p>
          <p className="text-sm text-[var(--dim)]">
            {brand} · Tỉ lệ {scale} ·{" "}
            {variants.map((v) => v.colorName).filter(Boolean).join(", ") || "Chưa có màu"}
          </p>
          <p className="mt-1 text-sm">
            {variants.map((v, i) => {
              const p = Number(v.price.replace(/[^\d]/g, ""));
              return p > 0 ? (
                <span key={i} className="mr-3">
                  {v.colorName || `Màu ${i + 1}`}: <strong>{fmtVND(p)}</strong> · còn{" "}
                  {v.stock || 0}
                </span>
              ) : null;
            })}
          </p>
          {description && (
            <div className="mt-2 text-sm text-[var(--dim)]">{renderRichText(description)}</div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ProductDetailTitleDescSection({
  name,
  setName,
  description,
  setDescription,
  descPreview,
  descRef,
}: {
  name: string;
  setName: (n: string) => void;
  description: string;
  setDescription: (d: string) => void;
  descPreview: boolean;
  descRef: RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <section className={cardCls} aria-label="Tiêu đề và mô tả">
      <label className={labelCls} htmlFor="pd-name">
        Tiêu đề
      </label>
      <input
        id="pd-name"
        className={inputCls}
        value={name}
        maxLength={160}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ví dụ: Toyota GR Supra"
      />
      <p className="mt-1 text-right text-xs text-[var(--dim)]">{name.length} / 160</p>

      <label className={labelCls} htmlFor="pd-desc">
        Mô tả
      </label>
      {descPreview ? (
        <div className="mt-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
          {description ? (
            renderRichText(description)
          ) : (
            <p className="text-[var(--dim)]">Chưa có mô tả.</p>
          )}
        </div>
      ) : (
        <textarea
          id="pd-desc"
          ref={descRef}
          className={`${inputCls} mt-2`}
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả sản phẩm"
        />
      )}
    </section>
  );
}

export function ProductDetailSeoSection({
  name,
  setName,
  description,
  setDescription,
  seoOpen,
  setSeoOpen,
}: {
  name: string;
  setName: (n: string) => void;
  description: string;
  setDescription: (d: string) => void;
  seoOpen: boolean;
  setSeoOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  return (
    <section
      className={`${cardCls} mt-4`}
      aria-label="Xem trước hiển thị trên công cụ tìm kiếm"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Xem trước hiển thị trên công cụ tìm kiếm</h2>
        <button
          type="button"
          aria-expanded={seoOpen}
          onClick={() => setSeoOpen((s) => !s)}
          className="text-sm font-medium text-[var(--accent)]"
        >
          Sửa SEO
        </button>
      </div>
      <div className="mt-3 rounded-lg border border-[var(--border)] px-4 py-3">
        <p className="text-base text-[#1558b0]">{name.trim() || "Tên sản phẩm"}</p>
        <p className="text-xs text-[#3d7a44]">
          Web bán hàng › Sản phẩm ›{" "}
          {(name.trim() || "san-pham").toLowerCase().replace(/\s+/g, "-")}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-[var(--dim)]">
          {description.trim() || "Mô tả sản phẩm sẽ hiện ở đây."}
        </p>
      </div>
      {seoOpen && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="pd-seo-title">
              Tiêu đề SEO
            </label>
            <input
              id="pd-seo-title"
              className={inputCls}
              value={name}
              maxLength={160}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="pd-seo-desc">
              Mô tả SEO
            </label>
            <input
              id="pd-seo-desc"
              className={inputCls}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      )}
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
}: {
  product: Product | null;
  confirmDelete: boolean;
  setConfirmDelete: (v: boolean) => void;
  isPendingDelete: boolean;
  onDelete: () => void;
  onBack: () => void;
  isPendingSave: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {product &&
        (confirmDelete ? (
          <>
            <span className="text-sm text-[#9c2b2b]">
              Xóa hẳn “{product.name}” khỏi database chung?
            </span>
            <button
              type="button"
              disabled={isPendingDelete}
              onClick={onDelete}
              className="rounded-lg bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Chắc chắn xóa
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className={smallBtn}
            >
              Không xóa
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white"
          >
            Xóa sản phẩm
          </button>
        ))}
      <span className="flex-1" />
      <button type="button" onClick={onBack} className={smallBtn}>
        Hủy
      </button>
      <button
        type="button"
        disabled={isPendingSave}
        onClick={onSubmit}
        className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPendingSave ? "Đang lưu…" : product ? "Lưu" : "Thêm sản phẩm"}
      </button>
    </div>
  );
}

