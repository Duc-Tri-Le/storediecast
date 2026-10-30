import { cardCls, inputCls, labelCls } from "./shared";

export function AddProductSeoSection({
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
            <label className={labelCls} htmlFor="ap-seo-title">
              Tiêu đề SEO
            </label>
            <input
              id="ap-seo-title"
              className={inputCls}
              value={name}
              maxLength={160}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="ap-seo-desc">
              Mô tả SEO
            </label>
            <input
              id="ap-seo-desc"
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

