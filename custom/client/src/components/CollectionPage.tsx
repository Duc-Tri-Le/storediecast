import type { Product, ScaleFilter } from "../types";
import { COLLECTIONS } from "../data/collections";
import { resolveProductImage } from "../data/maps";
import { effectivePrice, fmt } from "../services/pricing";

export function CollectionPage({
  allProducts,
  loading,
  onViewScale,
}: {
  allProducts: Product[];
  loading: boolean;
  onViewScale: (s: ScaleFilter) => void;
}) {
  const totalCount = allProducts.length;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <h1 className="text-3xl font-black tracking-tight">Bộ sưu tập</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--dim)]">
        Shop có 3 bộ sưu tập theo tỉ lệ 1:64, 1:32 và 1:16, mỗi tỉ lệ phù hợp với một kiểu
        trưng bày và sưu tầm khác nhau. Bộ nhỏ gọn để sưu tầm nhiều mẫu, bộ vừa tay để chơi
        và trưng, bộ cỡ lớn để làm tâm điểm kệ trưng. Chọn một tỉ lệ bên dưới để xem các mẫu
        thuộc tỉ lệ đó.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {COLLECTIONS.map((c) => {
          const items = allProducts.filter((p) => p.scale === c.scale);
          const totalStock = items.reduce((s, p) => s + Math.max(0, p.stock), 0);
          const prices = items.map(effectivePrice);
          const minPrice = prices.length > 0 ? Math.min(...prices) : null;
          const repr = items.find((p) => p.isFeatured) ?? items[0];
          const imgSrc = repr ? resolveProductImage(repr.imageKey, c.img) : c.img;
          const imgAlt = repr
            ? `Ảnh đại diện bộ tỉ lệ ${c.scale}: ${repr.name}`
            : c.alt;
          return (
            <article
              key={c.scale}
              aria-label={`Bộ sưu tập tỉ lệ ${c.scale}`}
              onClick={() => onViewScale(c.scale)}
              className="flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition hover:border-[var(--accent)]"
            >
              <img
                src={imgSrc}
                alt={imgAlt}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                  Bộ sưu tập
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight">
                  Tỉ lệ {c.scale}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{c.desc}</p>
                <dl className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-4 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--dim)]">Số mẫu</dt>
                    <dd className="font-semibold tabular-nums">
                      {loading ? "…" : `${items.length} mẫu`}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--dim)]">Tổng tồn kho</dt>
                    <dd className="font-semibold tabular-nums">
                      {loading ? "…" : `${totalStock} chiếc`}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--dim)]">Giá từ</dt>
                    <dd className="font-black tabular-nums text-[var(--accent)]">
                      {loading || minPrice == null ? "…" : fmt(minPrice)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto pt-5">
                  <button
                    type="button"
                    onClick={() => onViewScale(c.scale)}
                    aria-label={`Xem bộ sưu tập tỉ lệ ${c.scale} ở trang Sản phẩm`}
                    className="w-full rounded-full bg-[var(--accent)] py-3 text-sm font-bold text-white"
                  >
                    Xem bộ sưu tập
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
          aria-label={
            loading
              ? "Xem tất cả sản phẩm ở trang Sản phẩm"
              : `Xem tất cả sản phẩm ở trang Sản phẩm, ${totalCount} mẫu`
          }
          className="rounded-full bg-[var(--dark)] px-8 py-3.5 text-sm font-bold text-white"
        >
          Tất cả sản phẩm
          {!loading && totalCount > 0 ? (
            <span className="tabular-nums"> ({totalCount} mẫu)</span>
          ) : null}
          <span aria-hidden> →</span>
        </button>
      </div>
    </main>
  );
}

