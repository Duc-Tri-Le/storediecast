import { cardCls, inputCls, labelCls } from "./shared";
import { slugify } from "../utils/slug";

/**
 * Phần SEO & Tìm kiếm (Google Search Snippet Preview & URL Handle) chuẩn SaaS
 * Đường dẫn hiển thị ở đây chính là đường dẫn truy cập sản phẩm trên web bán hàng custom
 */
export function ProductDetailSeoSection({
  productId,
  name,
  description,
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  slug,
  setSlug,
  seoOpen,
  setSeoOpen,
}: {
  productId?: number | null;
  name: string;
  description: string;
  seoTitle: string;
  setSeoTitle: (t: string) => void;
  seoDescription: string;
  setSeoDescription: (d: string) => void;
  slug: string;
  setSlug: (s: string) => void;
  seoOpen: boolean;
  setSeoOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
}) {
  const effectiveTitle =
    (seoTitle.trim() || name.trim() || "Tên sản phẩm mô hình") + " — XE ĐỎ Mô Hình";
  const effectiveSlug = slug.trim() || slugify(name.trim()) || "san-pham";
  const effectiveDesc =
    seoDescription.trim() ||
    description.trim() ||
    "Xem chi tiết xe mô hình chính hãng với đầy đủ thông số kỹ thuật, hình ảnh các màu sắc và giá bán ưu đãi tại XE ĐỎ.";
  const productLiveUrl = productId
    ? `http://localhost:3000/products/${productId}`
    : `http://localhost:3000/products/${effectiveSlug}`;

  return (
    <section className={`${cardCls} p-4 sm:p-5`} aria-label="SEO & Tìm kiếm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[var(--text)]">
            Tối ưu hóa công cụ tìm kiếm (SEO)
          </h2>
          <p className="mt-0.5 text-xs text-[var(--dim)]">
            Xem trước và tinh chỉnh tiêu đề, mô tả và đường dẫn truy cập sản phẩm trên web khách.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSeoOpen((s) => !s)}
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--sidebar)] transition"
        >
          {seoOpen ? "Thu gọn" : "Chỉnh sửa SEO"}
        </button>
      </div>

      {/* Google snippet preview */}
      <div className="mt-3.5 rounded-xl border border-[var(--border)] bg-[var(--table-head)]/40 p-3.5 sm:p-4 text-left">
        <a
          href={productLiveUrl}
          target="_blank"
          rel="noreferrer"
          className="truncate text-base font-semibold text-[#1558b0] hover:underline block"
          title="Bấm để mở thử trên web khách"
        >
          {effectiveTitle}
        </a>
        <p className="truncate text-xs text-[#3d7a44] mt-0.5 font-medium flex items-center gap-1.5">
          <span>{productLiveUrl}</span>
          <span className="text-[10px] text-[var(--dim)] font-normal">↗ Web khách</span>
        </p>
        <p className="mt-1.5 line-clamp-2 text-xs text-[var(--dim)] leading-relaxed">
          {effectiveDesc}
        </p>
      </div>

      {seoOpen && (
        <div className="mt-4 space-y-4 pt-3.5 border-t border-[var(--border)]">
          {/* Tiêu đề SEO */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls} htmlFor="pd-seo-t">
                Tiêu đề trang (SEO Title)
              </label>
              <span className="text-[11px] text-[var(--dim)] font-mono">
                {(seoTitle || name).length}/70 ký tự khuyến nghị
              </span>
            </div>
            <input
              id="pd-seo-t"
              className={`${inputCls} text-xs py-2`}
              value={seoTitle}
              maxLength={160}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={name || "Tiêu đề trang xuất hiện trên Google"}
            />
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Để trống sẽ tự động lấy theo Tên xe mô hình phía trên.
            </p>
          </div>

          {/* Mô tả SEO */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls} htmlFor="pd-seo-d">
                Mô tả meta (SEO Description)
              </label>
              <span className="text-[11px] text-[var(--dim)] font-mono">
                {(seoDescription || description).length}/160 ký tự khuyến nghị
              </span>
            </div>
            <textarea
              id="pd-seo-d"
              rows={3}
              className={`${inputCls} text-xs py-2 leading-relaxed`}
              value={seoDescription}
              maxLength={320}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={
                description ||
                "Tóm tắt ngắn gọn và hấp dẫn về sản phẩm để thu hút người click từ Google"
              }
            />
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Để trống sẽ tự động trích dẫn từ Mô tả chi tiết của sản phẩm.
            </p>
          </div>

          {/* Đường dẫn URL và tên xử lý (Slug) */}
          <div>
            <label className={labelCls} htmlFor="pd-seo-slug">
              Đường dẫn URL và tên xử lý (Handle / Slug) <span className="text-[#c0392b]">*</span>
            </label>
            <div className="mt-1 flex items-center rounded-lg border border-[var(--border)] bg-white overflow-hidden focus-within:border-[var(--accent)]">
              <span className="shrink-0 bg-[var(--sidebar)] px-2.5 py-2 text-xs font-mono text-[var(--dim)] border-r border-[var(--border)]">
                http://localhost:3000/products/
              </span>
              <input
                id="pd-seo-slug"
                type="text"
                className="w-full bg-transparent px-3 py-2 text-xs font-mono text-[var(--text)] outline-none"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder={slugify(name) || "ten-san-pham"}
              />
            </div>
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Đường dẫn chính thức của sản phẩm này trên Web Bán Hàng cho khách (chỉ dùng chữ thường không dấu và gạch nối).
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

