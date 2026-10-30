import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { Product, ScaleFilter, VehicleFilter } from "../types";
import {
  SORTS,
  PRICE_RANGES,
  type PriceRangeKey,
  type SideSectionKey,
  type SortKey,
} from "../data/filters";
import { ProductFilterSidebar } from "./ProductFilterSidebar";
import { PolicyStrip } from "./PolicyStrip";
import { ProductCard, ProductListCard } from "./ProductCards";
import { ProductPagination } from "./ProductPagination";
import { ProductHotSaleAside } from "./ProductHotSaleAside";

export function ProductsPage({
  allProducts,
  loading,
  error,
  onRetry,
  scale,
  onScaleChange,
  vehicle,
  onVehicleChange,
  brand,
  onBrandChange,
  brandOptions,
  priceRange,
  onPriceRangeChange,
  sort,
  onSortChange,
  search,
  hasActiveFilters,
  onResetFilters,
  hotProducts,
  saleProducts,
  onDetail,
  onAdd,
  onBuyNow,
}: {
  allProducts: Product[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  scale: ScaleFilter;
  onScaleChange: (v: ScaleFilter) => void;
  vehicle: VehicleFilter;
  onVehicleChange: (v: VehicleFilter) => void;
  brand: string;
  onBrandChange: (v: string) => void;
  brandOptions: string[];
  priceRange: PriceRangeKey;
  onPriceRangeChange: (v: PriceRangeKey) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  search: string;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  hotProducts: Product[];
  saleProducts: Product[];
  onDetail: (p: Product) => void;
  onAdd: (p: Product) => void;
  onBuyNow: (p: Product) => void;
}) {
  const [openSections, setOpenSections] = useState<Record<SideSectionKey, boolean>>({
    scale: true,
    brand: brand !== "all",
    vehicle: false,
    price: false,
    hot: true,
    sale: true,
  });
  const toggleSection = (key: SideSectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const prevBrandRef = useRef(brand);
  useEffect(() => {
    if (prevBrandRef.current === brand) return;
    prevBrandRef.current = brand;
    setOpenSections((prev) => ({ ...prev, brand: brand !== "all" }));
  }, [brand]);

  const handleResetFilters = () => {
    setOpenSections((prev) => ({ ...prev, brand: false }));
    onResetFilters();
  };
  const [view, setView] = useState<"grid" | "list">("grid");

  const PAGE_SIZE = 30;
  const [currentPage, setCurrentPage] = useState(1);
  const productsTopRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setCurrentPage(1);
  }, [scale, vehicle, brand, priceRange, sort, search, view]);

  const activeRange = PRICE_RANGES.find((r) => r.key === priceRange);
  const pageQ = useQuery({
    queryKey: ["products", "page", scale, vehicle, brand, priceRange, sort, search, currentPage],
    queryFn: () =>
      api.listProducts({
        scale,
        search,
        vehicleType: vehicle,
        brand,
        priceMin: activeRange?.min ?? null,
        priceMax: activeRange?.max ?? null,
        sort,
        page: currentPage,
        pageSize: PAGE_SIZE,
      }),
  });
  const paginatedProducts = pageQ.data?.products ?? [];
  const totalCount = pageQ.data?.total ?? 0;
  const totalPages = pageQ.data?.totalPages ?? 1;
  const safePage = pageQ.data?.page ?? Math.min(Math.max(1, currentPage), totalPages);
  const gridLoading = loading || pageQ.isLoading;

  const scrollToProductsTop = () => {
    const el = productsTopRef.current;
    if (!el) return;
    const scroller = document.querySelector<HTMLElement>("[data-generated-space-root]");
    if (scroller) {
      const top =
        el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        76;
      scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToPage = (p: number) => {
    const nextPage = Math.min(Math.max(1, p), totalPages);
    if (nextPage === safePage) return;
    setCurrentPage(nextPage);
    requestAnimationFrame(() => scrollToProductsTop());
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-4">
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)_16rem] xl:grid-cols-[16rem_minmax(0,1fr)_17rem]">
        {/* ===== Cột trái: bộ lọc ===== */}
        <ProductFilterSidebar
          allProducts={allProducts}
          scale={scale}
          onScaleChange={onScaleChange}
          brand={brand}
          onBrandChange={onBrandChange}
          brandOptions={brandOptions}
          vehicle={vehicle}
          onVehicleChange={onVehicleChange}
          priceRange={priceRange}
          onPriceRangeChange={onPriceRangeChange}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
          openSections={openSections}
          onToggleSection={toggleSection}
        />

        {/* ===== Cột giữa: sản phẩm ===== */}
        <section ref={productsTopRef} aria-label="Danh sách sản phẩm" className="order-2 min-w-0 scroll-mt-24">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-sm font-semibold" role="status" aria-live="polite">
              {gridLoading ? "Đang tải…" : `${totalCount} sản phẩm`}
            </p>
            <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-[var(--dim)]">Sắp xếp theo</span>
                <select
                  value={sort}
                  onChange={(e) => onSortChange(e.target.value as SortKey)}
                  aria-label="Sắp xếp theo"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold outline-none focus:border-[var(--accent)]"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-[var(--dim)]">Xem</span>
                <div
                  role="group"
                  aria-label="Chọn kiểu xem: lưới hoặc danh sách"
                  className="flex overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)]"
                >
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    aria-pressed={view === "grid"}
                    aria-label="Xem dạng lưới"
                    className={`grid h-9 w-10 place-items-center transition ${
                      view === "grid"
                        ? "bg-[var(--dark)] text-white"
                        : "text-[var(--dim)] hover:text-[var(--text)]"
                    }`}
                  >
                    <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-pressed={view === "list"}
                    aria-label="Xem dạng danh sách"
                    className={`grid h-9 w-10 place-items-center transition ${
                      view === "list"
                        ? "bg-[var(--dark)] text-white"
                        : "text-[var(--dim)] hover:text-[var(--text)]"
                    }`}
                  >
                    <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M8 6h13" />
                      <path d="M8 12h13" />
                      <path d="M8 18h13" />
                      <path d="M3.5 6h.01" />
                      <path d="M3.5 12h.01" />
                      <path d="M3.5 18h.01" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
              <p className="font-semibold">Chưa tải được danh sách xe.</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white"
              >
                Thử tải lại
              </button>
            </div>
          ) : loading ? (
            <p className="mt-10 text-center text-sm text-[var(--dim)]">Đang xếp xe lên kệ…</p>
          ) : totalCount === 0 && !pageQ.isLoading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              {vehicle === "Xe máy" &&
              allProducts.filter((p) => p.vehicleType === "Xe máy").length === 0 ? (
                <>
                  <p className="font-semibold">Shop hiện chưa có mẫu xe máy nào.</p>
                  <p className="mt-1 text-sm text-[var(--dim)]">
                    Kệ hiện có ô tô và xe bán tải — mẫu xe máy sẽ được cập nhật khi shop có hàng.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Không có mẫu nào khớp bộ lọc này.</p>
                  <p className="mt-1 text-sm text-[var(--dim)]">
                    Thử bỏ bớt một điều kiện lọc — tỉ lệ, loại xe, hãng hoặc từ khóa tìm kiếm.
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                aria-label="Đặt lại bộ lọc — xem tất cả sản phẩm"
                className="mt-4 rounded-full bg-[var(--dark)] px-5 py-2.5 text-sm font-bold text-white"
              >
                Đặt lại lọc — xem tất cả sản phẩm
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
              {paginatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onDetail={onDetail} onAdd={onAdd} onBuyNow={onBuyNow} />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {paginatedProducts.map((p) => (
                <ProductListCard key={p.id} product={p} onDetail={onDetail} onAdd={onAdd} onBuyNow={onBuyNow} />
              ))}
            </div>
          )}

          {!gridLoading && !error && totalCount > 0 && totalPages > 1 && (
            <ProductPagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </section>

        {/* ===== Cột phải: Sản phẩm hot + Giảm giá ===== */}
        <ProductHotSaleAside
          hotProducts={hotProducts}
          saleProducts={saleProducts}
          openHot={openSections.hot}
          openSale={openSections.sale}
          onToggleHot={() => toggleSection("hot")}
          onToggleSale={() => toggleSection("sale")}
          onDetail={onDetail}
        />
      </div>

      <PolicyStrip />
    </main>
  );
}
