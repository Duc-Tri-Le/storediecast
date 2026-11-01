import { useState, useRef } from "react";
import type { CatalogData } from "../types";
import type {
  CollectionCondition,
  MatchMode,
} from "../utils/collectionRules";
import { directImageSrc } from "../utils/format";
import { slugify } from "../utils/slug";
import { Icon, cardCls, labelCls, inputCls } from "./shared";
import { ConditionsBuilder } from "./ConditionsEditor";

export function CollectionConditionsSection({
  conditions,
  matchMode,
  onChangeMatchMode,
  onChangeCondition,
  onAddCondition,
  onRemoveCondition,
  catalog,
  allTags,
}: {
  conditions: CollectionCondition[];
  matchMode: MatchMode;
  onChangeMatchMode: (m: MatchMode) => void;
  onChangeCondition: (i: number, patch: Partial<CollectionCondition>) => void;
  onAddCondition: () => void;
  onRemoveCondition: (i: number) => void;
  catalog: CatalogData | null;
  allTags: string[];
}) {
  return (
    <section className={`${cardCls} p-5 sm:p-6 space-y-4`} aria-label="Điều kiện của bộ sưu tập">
      <div className="border-b border-[var(--border)] pb-3">
        <h2 className="text-sm font-bold text-[var(--text)]">Điều kiện tự động gom sản phẩm</h2>
        <p className="mt-0.5 text-xs text-[var(--dim)]">
          Các mẫu xe mô hình thỏa mãn điều kiện bên dưới sẽ tự động được đưa vào bộ sưu tập này.
        </p>
      </div>

      <ConditionsBuilder
        conditions={conditions}
        matchMode={matchMode}
        onChangeMatchMode={onChangeMatchMode}
        onChangeCondition={onChangeCondition}
        onAddCondition={onAddCondition}
        onRemoveCondition={onRemoveCondition}
        catalog={catalog}
        allTags={allTags}
        showMatchMode={true}
        addLabel="Thêm điều kiện khác"
      />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--sidebar)]/40 p-3 sm:p-3.5 text-xs text-[var(--dim)] leading-relaxed">
        💡 <strong>Mẹo chọn giá trị:</strong> Giá trị của Loại xe, Hãng xe, Hãng mô hình và Tỉ lệ lấy đúng từ Quản lý danh mục; giá trị Thẻ lấy từ các từ khóa đang có trên xe mô hình.
      </div>
    </section>
  );
}

export function CollectionSeoSection({
  title,
  description,
  seoTitle,
  seoDescription,
  slug,
  seoOpen,
  onToggleSeo,
  onChangeSeoTitle,
  onChangeSeoDesc,
  onChangeSlug,
}: {
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  seoOpen: boolean;
  onToggleSeo: () => void;
  onChangeSeoTitle: (v: string) => void;
  onChangeSeoDesc: (v: string) => void;
  onChangeSlug: (v: string) => void;
}) {
  const effectiveTitle = (seoTitle.trim() || title.trim() || "Tiêu đề bộ sưu tập") + " — XE ĐỎ Mô Hình";
  const effectiveSlug = slug.trim() || slugify(title.trim()) || "bo-suu-tap";
  const effectiveDesc =
    seoDescription.trim() ||
    description.trim() ||
    "Khám phá bộ sưu tập mô hình xe độc đáo, chất lượng cao tại XE ĐỎ. Giao hàng toàn quốc, cam kết chính hãng.";
  const collectionLiveUrl = `http://localhost:3000/collections/${effectiveSlug}`;

  return (
    <section className={`${cardCls} p-5 sm:p-6 space-y-4`} aria-label="Xem trước hiển thị trên công cụ tìm kiếm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3.5">
        <div>
          <h2 className="text-sm font-bold text-[var(--text)]">Tối ưu hóa công cụ tìm kiếm (SEO)</h2>
          <p className="mt-0.5 text-xs text-[var(--dim)]">
            Xem trước và tinh chỉnh tiêu đề, mô tả và đường dẫn truy cập bộ sưu tập trên web khách.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={seoOpen}
          onClick={onToggleSeo}
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--sidebar)] transition shadow-2xs"
        >
          {seoOpen ? "Thu gọn" : "Chỉnh sửa SEO"}
        </button>
      </div>

      {/* Google Snippet Preview */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--table-head)]/40 p-4 sm:p-5 text-left space-y-1">
        <a
          href={collectionLiveUrl}
          target="_blank"
          rel="noreferrer"
          className="truncate text-base font-semibold text-[#1558b0] hover:underline block"
          title="Bấm để mở thử trên web khách"
        >
          {effectiveTitle}
        </a>
        <p className="truncate text-xs text-[#3d7a44] font-medium flex items-center gap-1.5">
          <span>{collectionLiveUrl}</span>
          <span className="text-[10px] text-[var(--dim)] font-normal">↗ Web khách</span>
        </p>
        <p className="pt-0.5 line-clamp-2 text-xs text-[var(--dim)] leading-relaxed">
          {effectiveDesc}
        </p>
      </div>

      {seoOpen && (
        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls} htmlFor="cd-seo-title">
                Tiêu đề trang (SEO Title)
              </label>
              <span className="text-[11px] text-[var(--dim)] font-mono">
                {(seoTitle || title).length}/70 ký tự khuyến nghị
              </span>
            </div>
            <input
              id="cd-seo-title"
              className={`${inputCls} text-xs py-2`}
              value={seoTitle}
              maxLength={160}
              onChange={(e) => onChangeSeoTitle(e.target.value)}
              placeholder={title || "Tiêu đề bộ sưu tập xuất hiện trên Google"}
            />
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Để trống sẽ tự động lấy theo Tên bộ sưu tập phía trên.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls} htmlFor="cd-seo-desc">
                Mô tả meta (SEO Description)
              </label>
              <span className="text-[11px] text-[var(--dim)] font-mono">
                {(seoDescription || description).length}/160 ký tự khuyến nghị
              </span>
            </div>
            <textarea
              id="cd-seo-desc"
              rows={3}
              className={`${inputCls} text-xs py-2 leading-relaxed`}
              value={seoDescription}
              maxLength={320}
              onChange={(e) => onChangeSeoDesc(e.target.value)}
              placeholder="Mô tả ngắn gọn thu hút người dùng nhấp vào link trên Google..."
            />
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Để trống sẽ tự động trích dẫn từ Mô tả chi tiết của bộ sưu tập.
            </p>
          </div>

          <div>
            <label className={labelCls} htmlFor="cd-seo-slug">
              Đường dẫn URL và tên xử lý (Handle / Slug) <span className="text-[#c0392b]">*</span>
            </label>
            <div className="mt-1 flex items-center rounded-lg border border-[var(--border)] bg-white overflow-hidden focus-within:border-[var(--accent)]">
              <span className="shrink-0 bg-[var(--sidebar)] px-3 py-2 text-xs font-mono text-[var(--dim)] border-r border-[var(--border)]">
                http://localhost:3000/collections/
              </span>
              <input
                id="cd-seo-slug"
                type="text"
                className="w-full bg-transparent px-3 py-2 text-xs font-mono text-[var(--text)] outline-none"
                value={slug}
                onChange={(e) => onChangeSlug(slugify(e.target.value))}
                placeholder={slugify(title) || "ten-bo-suu-tap"}
              />
            </div>
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Đường dẫn chính thức của bộ sưu tập này trên Web Bán Hàng cho khách (chỉ dùng chữ thường không dấu và gạch nối).
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export function CollectionImageSection({
  title,
  imageKey,
  imageName,
  imageError,
  onImageFile,
  onRemoveImage,
}: {
  title: string;
  imageKey: string;
  imageName: string;
  imageError: string | null;
  onImageFile: (f: File | undefined) => void;
  onRemoveImage: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);

  return (
    <section className={`${cardCls} p-5 sm:p-6 space-y-4`} aria-label="Ảnh bộ sưu tập">
      <div className="border-b border-[var(--border)] pb-3">
        <h2 className="text-sm font-bold text-[var(--text)]">Ảnh bìa bộ sưu tập</h2>
        <p className="mt-0.5 text-xs text-[var(--dim)]">
          Ảnh đại diện hiển thị trên banner trang chi tiết và danh mục bộ sưu tập.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Tải ảnh bộ sưu tập lên từ máy"
        onClick={() => imageFileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            imageFileRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void onImageFile(e.dataTransfer.files?.[0]);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-colors ${
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border)] hover:border-[var(--accent)] bg-[var(--table-head)]/20"
        }`}
      >
        {directImageSrc(imageKey) ? (
          <img
            src={directImageSrc(imageKey) ?? undefined}
            alt={`Ảnh bộ sưu tập ${title}`}
            className="mx-auto max-h-48 rounded-lg object-cover shadow-sm"
          />
        ) : (
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold shadow-2xs">
              <Icon d="M12 16V5 M7.5 9 12 4.5 16.5 9 M4 20h16" size={15} /> Tải ảnh lên
            </span>
            <p className="text-xs text-[var(--dim)] leading-relaxed">
              Kéo thả file ảnh vào đây hoặc bấm để chọn từ máy tính
            </p>
          </div>
        )}
      </div>
      <input
        ref={imageFileRef}
        type="file"
        accept="image/*"
        aria-label="Chọn ảnh bộ sưu tập từ máy"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void onImageFile(f);
        }}
      />
      {imageName && (
        <p className="text-xs text-[var(--dim)] font-mono">Đã chọn: {imageName}</p>
      )}
      {imageError && (
        <p className="rounded-xl bg-[#fbe3e3] p-3 text-xs text-[#9c2b2b] font-medium">
          {imageError}
        </p>
      )}
      {imageKey && (
        <button
          type="button"
          onClick={onRemoveImage}
          className="rounded-lg border border-[#e3b3b3] bg-white px-3 py-1.5 text-xs font-semibold text-[#9c2b2b] hover:bg-[#fbe3e3] transition"
        >
          Bỏ ảnh này
        </button>
      )}
      <div className="rounded-lg bg-[var(--sidebar)]/50 p-3 text-[11px] text-[var(--dim)] leading-relaxed">
        ℹ️ Ảnh được nén và lưu đồng bộ vào database chung — hiển thị tự động trên Web Bán Hàng cho khách.
      </div>
    </section>
  );
}

export { CollectionPreviewModal } from "./CollectionPreviewModal";
