import type { Product, ScaleFilter, ShopCollection } from "../types";
import { resolveProductImage } from "../data/maps";
import { effectivePrice, fmt } from "../services/pricing";

export function CollectionsListView({
  collections,
  allProducts,
  loading,
  onNavigateCollection,
  onViewScale,
}: {
  collections: ShopCollection[];
  allProducts: Product[];
  loading: boolean;
  onNavigateCollection?: (slugOrPath: string) => void;
  onViewScale: (s: ScaleFilter) => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-[var(--text)]">Bộ sưu tập xe mô hình</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">
          Khám phá các bộ sưu tập xe mô hình chọn lọc theo từng tỉ lệ và chủ đề đặc sắc. Mỗi bộ sưu tập được tuyển chọn kỹ lưỡng để mang đến trải nghiệm trưng bày và sưu tầm trọn vẹn nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {collections.map((c) => {
          const scaleMatch = c.title.match(/1:(64|32|16)/)?.[0];
          const items = scaleMatch ? allProducts.filter((p) => p.scale === scaleMatch) : allProducts;
          const totalStock = items.reduce((s, p) => s + Math.max(0, p.stock), 0);
          const prices = items.map(effectivePrice);
          const minPrice = prices.length > 0 ? Math.min(...prices) : null;
          const repr = items.find((p) => p.isFeatured) ?? items[0];
          const imgSrc = c.imageKey
            ? resolveProductImage(c.imageKey)
            : repr
              ? resolveProductImage(repr.imageKey)
              : "/placeholder.png";

          return (
            <article
              key={c.id}
              aria-label={`Bộ sưu tập ${c.title}`}
              onClick={() => onNavigateCollection?.(String(c.id))}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-xl"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-white">
                <img
                  src={imgSrc}
                  alt={c.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                  Bộ sưu tập
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {c.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--dim)] line-clamp-2">
                  {c.description || "Bộ sưu tập xe mô hình cao cấp chính hãng tại XE ĐỎ."}
                </p>

                <dl className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-4 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--dim)] text-xs">Số lượng</dt>
                    <dd className="font-semibold tabular-nums text-xs">
                      {loading ? "…" : `${items.length} mẫu xe`}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--dim)] text-xs">Tồn kho</dt>
                    <dd className="font-semibold tabular-nums text-xs">
                      {loading ? "…" : `${totalStock} chiếc`}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--dim)] text-xs">Giá từ</dt>
                    <dd className="font-black tabular-nums text-[var(--accent)] text-xs">
                      {loading || minPrice == null ? "…" : fmt(minPrice)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto pt-5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateCollection?.(String(c.id));
                    }}
                    className="w-full rounded-full bg-[var(--accent)] py-2.5 text-xs font-bold text-white transition hover:bg-[var(--accent-dark)] shadow-xs cursor-pointer"
                  >
                    Khám phá bộ sưu tập →
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => onViewScale("all")}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-dark)] shadow-md hover:shadow-lg cursor-pointer"
        >
          <span>Xem tất cả sản phẩm</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </main>
  );
}

