import React from "react";
import type { Product, ShopCollection } from "../types";
import { resolveProductImage } from "../data/maps";
import { effectivePrice, fmt } from "../services/pricing";
import { ProductPagination } from "./ProductPagination";
import { CollectionHeroBanner } from "./CollectionHeroBanner";
import { CollectionFilterToolbar } from "./CollectionFilterToolbar";
import type { CollectionStorefrontSort } from "../hooks/useCollectionFilter";

export function CollectionDetailView({
  currentCollection,
  baseCollectionProducts,
  availableBrands,
  availableVehicles,
  availableScales,
  processedProducts,
  paginatedProducts,
  selectedBrand,
  selectedVehicle,
  selectedScale,
  searchQuery,
  sortKey,
  totalPages,
  safePage,
  totalStockCount,
  minPriceInCollection,
  productsTopRef,
  onNavigateCollection,
  onBrandChange,
  onVehicleChange,
  onScaleChange,
  onSortChange,
  onSearchChange,
  onResetFilters,
  onPageChange,
  onOpenProduct,
}: {
  currentCollection: ShopCollection;
  baseCollectionProducts: Product[];
  availableBrands: string[];
  availableVehicles: string[];
  availableScales: string[];
  processedProducts: Product[];
  paginatedProducts: Product[];
  selectedBrand: string;
  selectedVehicle: string;
  selectedScale: string;
  searchQuery: string;
  sortKey: CollectionStorefrontSort;
  totalPages: number;
  safePage: number;
  totalStockCount: number;
  minPriceInCollection: number | null;
  productsTopRef: React.RefObject<HTMLDivElement | null>;
  onNavigateCollection?: (slugOrPath: string) => void;
  onBrandChange: (b: string) => void;
  onVehicleChange: (v: string) => void;
  onScaleChange: (s: string) => void;
  onSortChange: (st: CollectionStorefrontSort) => void;
  onSearchChange: (q: string) => void;
  onResetFilters: () => void;
  onPageChange: (p: number) => void;
  onOpenProduct?: (p: Product) => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 space-y-6">
      {/* Hero Banner & Breadcrumbs */}
      <CollectionHeroBanner
        currentCollection={currentCollection}
        baseProductsCount={baseCollectionProducts.length}
        totalStockCount={totalStockCount}
        minPriceInCollection={minPriceInCollection}
        onNavigateBack={() => onNavigateCollection?.("")}
      />

      {/* Thanh công cụ lọc & Sắp xếp trong bộ */}
      <CollectionFilterToolbar
        currentCollection={currentCollection}
        baseCollectionProductsCount={baseCollectionProducts.length}
        availableBrands={availableBrands}
        availableVehicles={availableVehicles}
        availableScales={availableScales}
        processedProductsCount={processedProducts.length}
        selectedBrand={selectedBrand}
        selectedVehicle={selectedVehicle}
        selectedScale={selectedScale}
        searchQuery={searchQuery}
        sortKey={sortKey}
        totalPages={totalPages}
        safePage={safePage}
        productsTopRef={productsTopRef}
        onBrandChange={onBrandChange}
        onVehicleChange={onVehicleChange}
        onScaleChange={onScaleChange}
        onSortChange={onSortChange}
        onSearchChange={onSearchChange}
      />

      {/* Lưới sản phẩm */}
      {processedProducts.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface2)] text-2xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-[var(--text)]">
            Không tìm thấy mẫu xe nào phù hợp
          </h3>
          <p className="text-xs text-[var(--dim)] max-w-md mx-auto">
            Không có mẫu xe nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn trong bộ sưu tập này.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-2 rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white transition hover:bg-[var(--accent-dark)] cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {paginatedProducts.map((p) => {
              const eff = effectivePrice(p);
              const hasDiscount = p.promoPrice != null && p.promoPrice > 0 && p.promoPrice < p.price;
              const discountPct = hasDiscount
                ? Math.round(((p.price - p.promoPrice!) / p.price) * 100)
                : 0;

              return (
                <article
                  key={p.id}
                  onClick={() => onOpenProduct?.(p)}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                    <img
                      src={resolveProductImage(p.imageKey)}
                      alt={p.name}
                      className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-[#c5221f] px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                        -{discountPct}%
                      </span>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      {p.scale}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--dim)]">
                      {p.brand} • {p.vehicleType}
                    </span>

                    <h3 className="mt-1 line-clamp-2 text-xs sm:text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                      {p.name}
                    </h3>

                    <div className="mt-auto pt-3 flex items-baseline justify-between gap-1">
                      <div>
                        <span className="text-sm sm:text-base font-black text-[var(--accent)]">
                          {fmt(eff)}
                        </span>
                        {hasDiscount && (
                          <span className="ml-1.5 text-[11px] text-[var(--dim)] line-through">
                            {fmt(p.price)}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-semibold ${
                          p.stock > 0 ? "text-[#137333]" : "text-[#c5221f]"
                        }`}
                      >
                        {p.stock > 0 ? "Còn hàng" : "Hết hàng"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <ProductPagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}

      {/* Nút quay lại danh sách tất cả bộ sưu tập */}
      <div className="pt-6 text-center">
        <button
          type="button"
          onClick={() => onNavigateCollection?.("")}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-xs font-bold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer"
        >
          <span>‹ Xem tất cả bộ sưu tập khác</span>
        </button>
      </div>
    </main>
  );
}
