import type { RefObject } from "react";
import type { CatalogData, Product, ShopCollection } from "../types";
import type { DraftVariant } from "../utils/productFormTypes";
import { effectiveImageKey } from "../utils/productFormTypes";
import { colorHex, directImageSrc } from "../utils/format";
import { cardCls, inputCls, labelCls, smallBtn } from "./shared";
import { BULK_TIER_ROWS } from "./VariantImagePicker";

export function ProductDetailMediaSection({
  variants,
  mediaTarget,
  setMediaTarget,
  mediaUrlOpen,
  setMediaUrlOpen,
  mediaUrl,
  onMediaUrlChange,
  mediaUrlState,
  applyMediaUrl,
  mediaFileRef,
  setOpenPicker,
}: {
  variants: DraftVariant[];
  mediaTarget: number;
  setMediaTarget: (i: number) => void;
  mediaUrlOpen: boolean;
  setMediaUrlOpen: (v: boolean | ((s: boolean) => boolean)) => void;
  mediaUrl: string;
  onMediaUrlChange: (url: string) => void;
  mediaUrlState: "idle" | "checking" | "ok" | "error";
  applyMediaUrl: () => void;
  mediaFileRef: RefObject<HTMLInputElement | null>;
  setOpenPicker: (i: number) => void;
}) {
  return (
    <section className={cardCls} aria-label="Media">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-sm font-bold">
          Media ({variants.length} ảnh — mỗi màu 1 ảnh)
        </h2>
        <button
          type="button"
          onClick={() => {
            setMediaUrlOpen((s) => !s);
          }}
          className="text-sm font-medium text-[var(--accent)]"
        >
          Thêm media từ URL
        </button>
        <button
          type="button"
          onClick={() => mediaFileRef.current?.click()}
          className="text-sm font-medium text-[var(--accent)]"
        >
          Thêm media từ máy
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="pd-media-target" className="text-[var(--dim)]">
          Ảnh mới sẽ gắn cho:
        </label>
        <select
          id="pd-media-target"
          className="rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-sm"
          value={Math.min(mediaTarget, Math.max(0, variants.length - 1))}
          onChange={(e) => setMediaTarget(Number(e.target.value))}
        >
          {variants.map((v, i) => (
            <option key={i} value={i}>
              Màu {i + 1}{v.colorName ? ` — ${v.colorName}` : ""}
            </option>
          ))}
        </select>
        <input
          ref={mediaFileRef}
          type="file"
          accept="image/*"
          aria-label="Thêm media từ máy"
          className="hidden"
        />
      </div>
      {mediaUrlOpen && (
        <div className="mt-3 rounded-lg bg-[var(--sidebar)] p-3">
          <label className={labelCls} htmlFor="pd-media-url">
            Link ảnh cho màu {mediaTarget + 1}
          </label>
          <input
            id="pd-media-url"
            className={inputCls}
            value={mediaUrl}
            onChange={(e) => onMediaUrlChange(e.target.value)}
            placeholder="https://…/anh.jpg"
            inputMode="url"
          />
          {(mediaUrlState === "checking" || mediaUrlState === "ok") && (
            <div className="mt-2 flex items-start gap-3">
              <img
                src={mediaUrl.trim()}
                alt="Xem trước media từ URL"
                className="h-20 w-24 rounded-lg border border-[var(--border)] object-cover"
                onLoad={() => {}}
                onError={() => {}}
              />
              <p className="text-sm text-[var(--dim)]">
                {mediaUrlState === "checking" ? "Đang tải ảnh xem trước…" : "Ảnh tải được."}
              </p>
            </div>
          )}
          {mediaUrlState === "error" && (
            <p className="mt-2 rounded-lg bg-[#fbe3e3] px-3 py-2 text-sm text-[#9c2b2b]">
              Link ảnh không hợp lệ hoặc không tải được ảnh — kiểm tra lại đường dẫn.
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={mediaUrlState !== "ok"}
              onClick={applyMediaUrl}
              className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Dùng link này
            </button>
            <button type="button" onClick={() => setMediaUrlOpen(false)} className={smallBtn}>
              Hủy
            </button>
          </div>
        </div>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {variants.map((v, i) => {
          const src = directImageSrc(effectiveImageKey(v));
          const isTarget = i === Math.min(mediaTarget, Math.max(0, variants.length - 1));
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setMediaTarget(i);
                setOpenPicker(i);
              }}
              aria-label={`Ảnh màu ${i + 1}${v.colorName ? ` — ${v.colorName}` : ""}`}
              className={`overflow-hidden rounded-lg border text-left ${
                isTarget ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]" : "border-[var(--border)]"
              }`}
            >
              {src ? (
                <img src={src} alt="" className="h-20 w-full object-cover" loading="lazy" />
              ) : (
                <span
                  className="flex h-20 w-full flex-col items-center justify-center gap-1"
                  style={{ background: `linear-gradient(135deg, ${colorHex(v.colorName)}33, ${colorHex(v.colorName)}11)` }}
                >
                  <span
                    className="block rounded-full border border-black/10"
                    style={{ width: 22, height: 22, background: colorHex(v.colorName) }}
                  />
                  <span className="max-w-full truncate px-1 font-mono text-[10px] text-[var(--dim)]">
                    {v.catalogKey}
                  </span>
                </span>
              )}
              <span className="block truncate px-2 py-1 text-xs">
                {v.colorName || `Màu ${i + 1}`} ·{" "}
                {v.imageMode === "link" ? "Từ link" : v.imageMode === "upload" ? "Từ máy" : "Có sẵn"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[var(--dim)]">
        Bấm vào một ảnh để chọn ảnh đó làm đích thêm media và mở phần đổi ảnh của màu tương ứng ở bảng Biến thể bên dưới.
      </p>
    </section>
  );
}

export function ProductDetailOrganizationSection({
  vehicleType,
  setVehicleType,
  brand,
  setBrand,
  modelMaker,
  setModelMaker,
  scale,
  setScale,
  catalog,
  product,
  productCollections,
  tags,
  setTags,
  tagDraft,
  setTagDraft,
  addTag,
}: {
  vehicleType: string;
  setVehicleType: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  modelMaker: string;
  setModelMaker: (v: string) => void;
  scale: string;
  setScale: (v: string) => void;
  catalog: CatalogData | null;
  product: Product | null;
  productCollections: ShopCollection[];
  tags: string[];
  setTags: (tags: string[]) => void;
  tagDraft: string;
  setTagDraft: (v: string) => void;
  addTag: () => void;
}) {
  return (
    <>
      <section className={cardCls} aria-label="Tổ chức">
        <h2 className="text-sm font-bold">Tổ chức</h2>
        <div className="mt-3">
          <label className={labelCls} htmlFor="pd-type">
            Loại xe
          </label>
          <select
            id="pd-type"
            className={inputCls}
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="">— Chọn loại xe —</option>
            {(catalog?.vehicleTypes ?? []).map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className={labelCls} htmlFor="pd-brand">
            Hãng xe
          </label>
          <select
            id="pd-brand"
            className={inputCls}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">— Chọn hãng xe —</option>
            {(catalog?.carBrands ?? []).map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className={labelCls} htmlFor="pd-maker">
            Hãng mô hình (để sinh SKU nội bộ)
          </label>
          <select
            id="pd-maker"
            className={inputCls}
            value={modelMaker}
            onChange={(e) => setModelMaker(e.target.value)}
          >
            <option value="">— Chưa chọn (SKU chưa hoàn thiện) —</option>
            {(catalog?.modelMakers ?? []).map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className={labelCls} htmlFor="pd-scale">
            Tỉ lệ
          </label>
          <select
            id="pd-scale"
            className={inputCls}
            value={scale}
            onChange={(e) => setScale(e.target.value)}
          >
            <option value="">— Chọn tỉ lệ —</option>
            {(catalog?.scales ?? []).map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--dim)]">
            Bốn mục phân loại trên lấy đúng từ Quản lý danh mục.
          </p>
        </div>
        <div className="mt-3">
          <span className={labelCls}>Bộ sưu tập</span>
          {product == null ? (
            <p className="text-sm text-[var(--dim)]">
              Sản phẩm mới chưa thuộc bộ sưu tập nào.
            </p>
          ) : productCollections.length === 0 ? (
            <p className="text-sm text-[var(--dim)]">
              Chưa thuộc bộ sưu tập nào. Vào trang Bộ sưu tập để tạo bộ và thêm sản phẩm.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {productCollections.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center rounded-full bg-[var(--sidebar)] px-3 py-1 text-sm font-medium"
                  >
                    {c.title}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-[var(--dim)]">
                Bộ sưu tập hiện ở đây như thẻ tag.
              </p>
            </>
          )}
        </div>
        <div className="mt-3">
          <label className={labelCls} htmlFor="pd-tag">
            Thẻ
          </label>
          <div className="flex gap-2">
            <input
              id="pd-tag"
              className={inputCls}
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Ví dụ: Mở cửa, capo, cốp"
            />
            <button type="button" onClick={addTag} className={smallBtn}>
              Thêm thẻ
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--sidebar)] px-2.5 py-0.5 text-sm"
                >
                  {t}
                  <button
                    type="button"
                    aria-label={`Bỏ thẻ ${t}`}
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="text-[var(--dim)] hover:text-[#9c2b2b]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={cardCls} aria-label="Giảm giá theo số lượng">
        <h2 className="text-sm font-bold">Giảm giá theo số lượng</h2>
        <p className="mt-1 text-sm text-[var(--dim)]">
          Mua càng nhiều, giảm càng sâu — tính trên tổng số lượng của cả đơn.
        </p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {BULK_TIER_ROWS.map((t) => (
            <li
              key={t.label}
              className="flex items-center justify-between rounded-lg bg-[var(--sidebar)] px-3 py-2"
            >
              <span>{t.label}</span>
              <strong>−{t.pct}%</strong>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
