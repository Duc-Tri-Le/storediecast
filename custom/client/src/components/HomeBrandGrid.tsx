import { BRAND_LOGOS } from "../data/maps";

export function HomeBrandGrid({
  brandStats,
  loading,
  onOpenProducts,
  onPickBrand,
}: {
  brandStats: Array<{ brand: string; count: number }>;
  loading: boolean;
  onOpenProducts: () => void;
  onPickBrand: (b: string) => void;
}) {
  return (
    <section aria-label="Mua theo hãng" className="pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Mua theo hãng</h2>
          <p className="mt-1 text-sm text-[var(--dim)]">
            Bấm vào hãng để xem các mẫu của hãng đó đã lọc sẵn ở trang Sản phẩm.
          </p>
        </div>
        {brandStats.length > 0 ? (
          <button
            type="button"
            onClick={onOpenProducts}
            aria-label="Xem tất cả — sang trang Sản phẩm đủ 50 mẫu không lọc"
            className="shrink-0 text-sm font-bold text-[var(--accent)] underline-offset-2 hover:underline cursor-pointer"
          >
            Xem tất cả →
          </button>
        ) : null}
      </div>
      {loading ? (
        <p className="mt-8 text-center text-sm text-[var(--dim)]">Đang xếp xe lên kệ…</p>
      ) : brandStats.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--dim)]">
          Chưa có hãng nào trên kệ.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 lg:grid-cols-10">
          {brandStats.slice(0, 20).map(({ brand }) => {
            const logo = BRAND_LOGOS[brand];
            return (
              <button
                key={brand}
                type="button"
                onClick={() => onPickBrand(brand)}
                aria-label={`Mua theo hãng ${brand} — xem ở trang Sản phẩm đã lọc sẵn hãng này`}
                title={brand}
                className="flex h-16 w-full min-w-0 items-center justify-center px-1 transition hover:opacity-75 sm:h-20 cursor-pointer"
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={brand}
                    title={brand}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="block max-w-full break-words text-center text-sm font-extrabold leading-tight">
                    {brand}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

