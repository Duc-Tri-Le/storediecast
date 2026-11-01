import React from "react";
import type { ShopCollection } from "../types";
import type { CollectionStorefrontSort } from "../hooks/useCollectionFilter";

export function CollectionFilterToolbar({
  currentCollection,
  baseCollectionProductsCount,
  availableBrands,
  availableVehicles,
  availableScales,
  processedProductsCount,
  selectedBrand,
  selectedVehicle,
  selectedScale,
  searchQuery,
  sortKey,
  totalPages,
  safePage,
  productsTopRef,
  onBrandChange,
  onVehicleChange,
  onScaleChange,
  onSortChange,
  onSearchChange,
}: {
  currentCollection: ShopCollection;
  baseCollectionProductsCount: number;
  availableBrands: string[];
  availableVehicles: string[];
  availableScales: string[];
  processedProductsCount: number;
  selectedBrand: string;
  selectedVehicle: string;
  selectedScale: string;
  searchQuery: string;
  sortKey: CollectionStorefrontSort;
  totalPages: number;
  safePage: number;
  productsTopRef: React.RefObject<HTMLDivElement | null>;
  onBrandChange: (b: string) => void;
  onVehicleChange: (v: string) => void;
  onScaleChange: (s: string) => void;
  onSortChange: (st: CollectionStorefrontSort) => void;
  onSearchChange: (q: string) => void;
}) {
  return (
    <div ref={productsTopRef} className="space-y-4 border-b border-[var(--border)] pb-5">
      {/* Hàng 1: Các hãng xe */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--dim)]">
          <span>Hãng xe ({availableBrands.length + 1})</span>
          {selectedBrand !== "all" && (
            <button
              type="button"
              onClick={() => onBrandChange("all")}
              className="text-[var(--accent)] hover:underline capitalize font-semibold cursor-pointer"
            >
              ✕ Đặt lại hãng
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onBrandChange("all")}
            className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              selectedBrand === "all"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
            }`}
          >
            Tất cả hãng ({baseCollectionProductsCount})
          </button>
          {availableBrands.map((b) => {
            const isActive = selectedBrand === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => onBrandChange(b)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hàng 2: Loại xe (nếu > 1 loại) */}
      {availableVehicles.length > 1 && (
        <div className="space-y-2 pt-2 border-t border-[var(--border)]/50">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--dim)]">
            <span>Loại xe ({availableVehicles.length + 1})</span>
            {selectedVehicle !== "all" && (
              <button
                type="button"
                onClick={() => onVehicleChange("all")}
                className="text-[var(--accent)] hover:underline capitalize font-semibold cursor-pointer"
              >
                ✕ Đặt lại loại xe
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onVehicleChange("all")}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                selectedVehicle === "all"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "border border-[var(--border)] bg-[var(--surface)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
              }`}
            >
              Tất cả loại ({baseCollectionProductsCount})
            </button>
            {availableVehicles.map((v) => {
              const isActive = selectedVehicle === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onVehicleChange(v)}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-xs"
                      : "border border-[var(--border)] bg-[var(--surface)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hàng 3: Tỉ lệ (nếu > 1 tỉ lệ) */}
      {availableScales.length > 1 && (
        <div className="space-y-2 pt-2 border-t border-[var(--border)]/50">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--dim)]">
            <span>Tỉ lệ ({availableScales.length + 1})</span>
            {selectedScale !== "all" && (
              <button
                type="button"
                onClick={() => onScaleChange("all")}
                className="text-[var(--accent)] hover:underline capitalize font-semibold cursor-pointer"
              >
                ✕ Đặt lại tỉ lệ
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onScaleChange("all")}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                selectedScale === "all"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "border border-[var(--border)] bg-[var(--surface)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
              }`}
            >
              Tất cả tỉ lệ ({baseCollectionProductsCount})
            </button>
            {availableScales.map((s) => {
              const isActive = selectedScale === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onScaleChange(s)}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-xs"
                      : "border border-[var(--border)] bg-[var(--surface)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
                  }`}
                >
                  Tỉ lệ {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ô tìm kiếm & Sắp xếp */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border)]/70">
        <div className="relative flex-1 max-w-2xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)]">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            placeholder={`Tìm mẫu xe trong bộ sưu tập ${currentCollection.title}…`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-11 pr-10 py-2.5 text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--dim)] outline-none transition focus:border-[var(--accent)] shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--dim)] hover:text-[var(--text)] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-xs text-[var(--dim)] font-medium">
            {processedProductsCount} sản phẩm
            {totalPages > 1 && ` (Trang ${safePage}/${totalPages})`}
          </span>
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as CollectionStorefrontSort)}
            aria-label="Sắp xếp sản phẩm"
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--text)] outline-none focus:border-[var(--accent)] cursor-pointer shadow-xs transition"
          >
            <option value="featured">Nổi bật nhất</option>
            <option value="newest">Mẫu mới nhất</option>
            <option value="priceAsc">Giá: Thấp → Cao</option>
            <option value="priceDesc">Giá: Cao → Thấp</option>
            <option value="az">Tên: A → Z</option>
            <option value="za">Tên: Z → A</option>
          </select>
        </div>
      </div>
    </div>
  );
}

