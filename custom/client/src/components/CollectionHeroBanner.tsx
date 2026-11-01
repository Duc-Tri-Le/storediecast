import type { ShopCollection } from "../types";
import { resolveProductImage } from "../data/maps";
import { fmt } from "../services/pricing";

export function CollectionHeroBanner({
  currentCollection,
  baseProductsCount,
  totalStockCount,
  minPriceInCollection,
  onNavigateBack,
}: {
  currentCollection: ShopCollection;
  baseProductsCount: number;
  totalStockCount: number;
  minPriceInCollection: number | null;
  onNavigateBack?: () => void;
}) {
  const bannerImgSrc = currentCollection.imageKey
    ? resolveProductImage(currentCollection.imageKey)
    : null;

  return (
    <>
      {/* Breadcrumb dẫn hướng */}
      <nav aria-label="Đường dẫn trang" className="min-w-0 text-sm text-[var(--dim)]">
        <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
          <li>
            <button
              type="button"
              onClick={onNavigateBack}
              className="font-semibold underline-offset-2 hover:text-[var(--text)] hover:underline cursor-pointer"
            >
              Bộ sưu tập
            </button>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="max-w-[70vw] truncate font-semibold text-[var(--text)]">
            {currentCollection.title}
          </li>
        </ol>
      </nav>

      {/* Hero Banner Bộ sưu tập */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface2)] p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] items-center">
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              <span>Bộ sưu tập chính thức</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text)]">
              {currentCollection.title}
            </h1>

            {currentCollection.description ? (
              <p className="text-sm leading-relaxed text-[var(--dim)] max-w-xl">
                {currentCollection.description}
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--dim)] italic">
                Khám phá toàn bộ các mẫu xe mô hình tĩnh cao cấp thuộc bộ sưu tập {currentCollection.title} chính hãng tại XE ĐỎ.
              </p>
            )}

            {/* Thông tin thống kê nổi bật */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[var(--text)]">
                <span>{baseProductsCount} mẫu xe mô hình</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[var(--text)]">
                <span>📦</span>
                <span>{totalStockCount} chiếc sẵn sàng giao</span>
              </span>
              {minPriceInCollection != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[var(--accent)] font-bold">
                  <span>🏷️</span>
                  <span>Giá chỉ từ {fmt(minPriceInCollection)}</span>
                </span>
              )}
            </div>
          </div>

          {bannerImgSrc && (
            <div className="hidden lg:block shrink-0">
              <img
                src={bannerImgSrc}
                alt={currentCollection.title}
                className="h-44 w-60 object-cover rounded-2xl border border-[var(--border)] shadow-md"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

