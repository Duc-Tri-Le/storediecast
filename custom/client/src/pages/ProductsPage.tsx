import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { Product, ScaleFilter, VehicleFilter } from "../types";
import {
  PRICE_RANGES,
  type PriceRangeKey,
  type SideSectionKey,
  type SortKey,
} from "../data/filters";
import { ProductFilterSidebar } from "../components/ProductFilterSidebar";
import { PolicyStrip } from "../components/PolicyStrip";
import { ProductCard, ProductListCard } from "../components/ProductCards";
import { ProductPagination } from "../components/ProductPagination";
import { ProductHotSaleAside } from "../components/ProductHotSaleAside";
import { ProductQuickFilterToolbar } from "../components/ProductQuickFilterToolbar";

export function ProductsPage({
  allProducts,
  loading,
  error,
  onRetry,
  scale,
  onScaleChange,
  scaleOptions,
  vehicle,
  onVehicleChange,
  vehicleOptions,
  brand,
  onBrandChange,
  brandOptions,
  priceRange,
  onPriceRangeChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
  hasActiveFilters,
  onResetFilters,
  hotProducts,
  saleProducts,
  onDetail,
  onAdd,
  onBuyNow,
  pageNumber = 1,
  onPageChange,
}: {
  allProducts: Product[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  scale: ScaleFilter;
  onScaleChange: (v: ScaleFilter) => void;
  scaleOptions?: string[];
  vehicle: VehicleFilter;
  onVehicleChange: (v: VehicleFilter) => void;
  vehicleOptions?: string[];
  brand: string;
  onBrandChange: (v: string) => void;
  brandOptions: string[];
  priceRange: PriceRangeKey;
  onPriceRangeChange: (v: PriceRangeKey) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  search: string;
  onSearchChange?: (s: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  hotProducts: Product[];
  saleProducts: Product[];
  onDetail: (p: Product) => void;
  onAdd: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  pageNumber?: number;
  onPageChange?: (p: number) => void;
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
  const [currentPage, setCurrentPage] = useState(pageNumber || 1);
  const productsTopRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (pageNumber != null) {
      setCurrentPage(pageNumber);
    }
  }, [pageNumber]);

  const activeRange = PRICE_RANGES.find((r) => r.key === priceRange);

  // Thống kê số lượng theo loại xe và tỉ lệ
  const vehicleCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allProducts) {
      if (p.vehicleType) map.set(p.vehicleType, (map.get(p.vehicleType) || 0) + 1);
    }
    return map;
  }, [allProducts]);

  const scaleCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allProducts) {
      if (p.scale) map.set(p.scale, (map.get(p.scale) || 0) + 1);
    }
    return map;
  }, [allProducts]);

  const activeVehicleList = useMemo(() => {
    const list =
      vehicleOptions && vehicleOptions.length > 0
        ? [...vehicleOptions]
        : ["Ô tô", "Xe máy", "Xe bán tải"];
    for (const p of allProducts) {
      if (p.vehicleType && !list.includes(p.vehicleType)) {
        list.push(p.vehicleType);
      }
    }
    return list;
  }, [vehicleOptions, allProducts]);

  const activeScaleList = useMemo(() => {
    const list =
      scaleOptions && scaleOptions.length > 0 ? [...scaleOptions] : ["1:64", "1:32", "1:16"];
    for (const p of allProducts) {
      if (p.scale && !list.includes(p.scale)) {
        list.push(p.scale);
      }
    }
    return list;
  }, [scaleOptions, allProducts]);

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
    if (nextPage === safePage && nextPage === currentPage) return;
    setCurrentPage(nextPage);
    onPageChange?.(nextPage);
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
          scaleOptions={scaleOptions}
          brand={brand}
          onBrandChange={onBrandChange}
          brandOptions={brandOptions}
          vehicle={vehicle}
          onVehicleChange={onVehicleChange}
          vehicleOptions={vehicleOptions}
          priceRange={priceRange}
          onPriceRangeChange={onPriceRangeChange}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
          openSections={openSections}
          onToggleSection={toggleSection}
        />

        {/* ===== Cột giữa: sản phẩm ===== */}
        <section ref={productsTopRef} aria-label="Danh sách sản phẩm" className="order-2 min-w-0 scroll-mt-24 space-y-4">
          {/* Quick Filter Toolbar dàn trải ở trên */}
          <ProductQuickFilterToolbar
            activeVehicleList={activeVehicleList}
            vehicleCounts={vehicleCounts}
            vehicle={vehicle}
            onVehicleChange={onVehicleChange}
            activeScaleList={activeScaleList}
            scaleCounts={scaleCounts}
            scale={scale}
            onScaleChange={onScaleChange}
            allProductsCount={allProducts.length}
            search={search}
            onSearchChange={onSearchChange}
            sort={sort}
            onSortChange={onSortChange}
            totalCount={totalCount}
            gridLoading={gridLoading}
            view={view}
            setView={setView}
            onResetToPage1={() => goToPage(1)}
          />

          {error ? (
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
              <p className="font-semibold">Chưa tải được danh sách xe.</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white cursor-pointer"
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
                className="mt-4 rounded-full bg-[var(--dark)] px-5 py-2.5 text-sm font-bold text-white cursor-pointer"
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
