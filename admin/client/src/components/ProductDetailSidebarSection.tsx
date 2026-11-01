import type { Product, ShopCollection } from "../types";
import { cardCls, inputCls } from "./shared";
import { BULK_TIER_ROWS } from "./VariantImagePicker";

/**
 * Cột phải: Trạng thái & Nổi bật, Bộ sưu tập & Thẻ tính năng, Giảm giá chiết khấu
 */
export function ProductDetailSidebarSection({
  product,
  isFeatured,
  setIsFeatured,
  productCollections,
  tags,
  setTags,
  tagDraft,
  setTagDraft,
  addTag,
}: {
  product: Product | null;
  isFeatured: boolean;
  setIsFeatured: (f: boolean) => void;
  productCollections: ShopCollection[];
  tags: string[];
  setTags: (tags: string[]) => void;
  tagDraft: string;
  setTagDraft: (t: string) => void;
  addTag: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Card 1: Trạng thái hiển thị & Nổi bật */}
      <section className={`${cardCls} p-4 space-y-3`} aria-label="Trạng thái">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--dim)]">
          Trạng thái & Hiển thị
        </h3>

        <div className="flex items-center justify-between rounded-lg bg-[var(--sidebar)]/70 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                product ? "bg-[#22a06b] shadow-[0_0_8px_#22a06b88]" : "bg-[#d9a514]"
              }`}
            />
            <span className="font-semibold text-[var(--text)]">
              {product ? "Đang bán trên web" : "Chưa lưu (Bản nháp)"}
            </span>
          </div>
          {product && (
            <span className="text-[11px] text-[var(--dim)] font-mono">#{product.id}</span>
          )}
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-[var(--border)] p-2.5 transition hover:bg-[var(--sidebar)]/40">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-[var(--accent)]"
          />
          <div className="text-xs">
            <span className="font-semibold text-[var(--text)] block">Sản phẩm nổi bật</span>
            <span className="text-[var(--dim)] text-[11px] block mt-0.5">
              Ưu tiên hiển thị trên trang chủ và danh sách nổi bật của web khách.
            </span>
          </div>
        </label>
      </section>

      {/* Card 2: Bộ sưu tập & Thẻ tính năng */}
      <section className={`${cardCls} p-4 space-y-3`} aria-label="Phân loại & Thẻ">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--dim)]">
          Bộ sưu tập & Thẻ
        </h3>

        {/* Bộ sưu tập */}
        <div>
          <span className="block text-xs font-medium text-[var(--dim)] mb-1.5">
            Bộ sưu tập thuộc về
          </span>
          {productCollections.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {productCollections.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center rounded-md bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-dark)]"
                >
                  {c.title}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--dim)] italic">
              Chưa thuộc bộ sưu tập nào. Quản lý tại mục “Bộ sưu tập”.
            </p>
          )}
        </div>

        {/* Thẻ tag tính năng */}
        <div className="border-t border-[var(--border)] pt-3">
          <label className="block text-xs font-medium text-[var(--dim)] mb-1.5" htmlFor="pd-tag">
            Thẻ tính năng xe
          </label>
          <div className="flex gap-1.5">
            <input
              id="pd-tag"
              className={`${inputCls} text-xs py-1.5`}
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="VD: Mở cửa, Kim loại..."
            />
            <button
              type="button"
              onClick={addTag}
              className="shrink-0 rounded-lg bg-[var(--sidebar)] border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)]"
            >
              Thêm
            </button>
          </div>

          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-md bg-[var(--sidebar)] border border-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--text)]"
                >
                  {t}
                  <button
                    type="button"
                    aria-label={`Xóa thẻ ${t}`}
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="text-[var(--dim)] hover:text-[#c0392b] font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Card 3: Chiết khấu số lượng */}
      <section className={`${cardCls} p-4`} aria-label="Chiết khấu số lượng">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--dim)]">
            Chiết khấu mua nhiều
          </h3>
          <span className="text-[11px] text-[var(--accent)] font-semibold">Tự động</span>
        </div>
        <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] overflow-hidden text-xs">
          {BULK_TIER_ROWS.map((t) => (
            <div key={t.label} className="flex items-center justify-between px-3 py-1.5 bg-white">
              <span className="text-[var(--dim)]">{t.label}</span>
              <span className="font-bold text-[#14663c]">−{t.pct}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

