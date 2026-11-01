import { cardCls, inputCls, labelCls } from "./shared";
import { slugify } from "../utils/slug";

export function CollectionCreatorSeoSection({
  title,
  description,
  slug,
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  customSlug,
  setCustomSlug,
  seoOpen,
  setSeoOpen,
}: {
  title: string;
  description: string;
  slug: string;
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDescription: string;
  setSeoDescription: (v: string) => void;
  customSlug: string;
  setCustomSlug: (v: string) => void;
  seoOpen: boolean;
  setSeoOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  return (
    <section className={`${cardCls} p-5`} aria-label="Xem trước SEO">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Xem trước SEO website</h2>
          <p className="mt-0.5 text-xs text-[var(--dim)]">
            Mô phỏng cách bộ sưu tập hiển thị trên kết quả tìm kiếm Google
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSeoOpen((v) => !v)}
          className="text-xs font-semibold text-[var(--accent)] hover:underline"
        >
          {seoOpen ? "Thu gọn" : "Chỉnh sửa SEO"}
        </button>
      </div>

      {/* Google Snippet Preview */}
      <div className="mt-3.5 rounded-xl border border-[var(--border)] bg-[var(--table-head)]/40 p-3.5 sm:p-4 text-left">
        <a
          href={`http://localhost:3000/collections/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="truncate text-base font-semibold text-[#1558b0] hover:underline block"
          title="Bấm để mở thử trên web khách"
        >
          {(seoTitle.trim() || title.trim() || "Tiêu đề bộ sưu tập") + " — XE ĐỎ Mô Hình"}
        </a>
        <p className="truncate text-xs text-[#3d7a44] mt-0.5 font-medium flex items-center gap-1.5">
          <span>{`http://localhost:3000/collections/${slug}`}</span>
          <span className="text-[10px] text-[var(--dim)] font-normal">↗ Web khách</span>
        </p>
        <p className="mt-1.5 line-clamp-2 text-xs text-[var(--dim)] leading-relaxed">
          {seoDescription.trim() ||
            description.trim() ||
            "Khám phá bộ sưu tập mô hình xe độc đáo, chất lượng cao tại XE ĐỎ. Giao hàng toàn quốc, cam kết chính hãng."}
        </p>
      </div>

      {seoOpen && (
        <div className="mt-4 space-y-4 pt-3.5 border-t border-[var(--border)]">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls} htmlFor="cc-seo-title">
                Tiêu đề trang (SEO Title)
              </label>
              <span className="text-[11px] text-[var(--dim)] font-mono">
                {(seoTitle || title).length}/70 ký tự khuyến nghị
              </span>
            </div>
            <input
              id="cc-seo-title"
              className={`${inputCls} text-xs py-2`}
              maxLength={160}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title.trim() || "Tiêu đề bộ sưu tập xuất hiện trên Google"}
            />
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Để trống sẽ tự động lấy theo Tên bộ sưu tập phía trên.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls} htmlFor="cc-seo-desc">
                Mô tả meta (SEO Description)
              </label>
              <span className="text-[11px] text-[var(--dim)] font-mono">
                {(seoDescription || description).length}/160 ký tự khuyến nghị
              </span>
            </div>
            <textarea
              id="cc-seo-desc"
              rows={3}
              maxLength={320}
              className={`${inputCls} text-xs py-2 leading-relaxed`}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn thu hút người dùng nhấp vào link trên Google..."
            />
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Để trống sẽ tự động lấy từ Mô tả bộ sưu tập phía trên.
            </p>
          </div>
          <div>
            <label className={labelCls} htmlFor="cc-seo-slug">
              Đường dẫn URL và tên xử lý (Handle / Slug) <span className="text-[#c0392b]">*</span>
            </label>
            <div className="mt-1 flex items-center rounded-lg border border-[var(--border)] bg-white overflow-hidden focus-within:border-[var(--accent)]">
              <span className="shrink-0 bg-[var(--sidebar)] px-2.5 py-2 text-xs font-mono text-[var(--dim)] border-r border-[var(--border)]">
                http://localhost:3000/collections/
              </span>
              <input
                id="cc-seo-slug"
                type="text"
                className="w-full bg-transparent px-3 py-2 text-xs font-mono text-[var(--text)] outline-none"
                value={customSlug}
                onChange={(e) => setCustomSlug(slugify(e.target.value))}
                placeholder={slugify(title) || "ten-bo-suu-tap"}
              />
            </div>
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Đường dẫn chính thức của bộ sưu tập này trên Web Bán Hàng cho khách.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

