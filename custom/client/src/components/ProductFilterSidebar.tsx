import { useState } from "react";
import type { Product, ScaleFilter, VehicleFilter } from "../types";
import {
  PRICE_RANGES,
  type PriceRangeKey,
  type SideSectionKey,
} from "../data/filters";
import {
  SideSection,
  FilterOptionRow,
  RadioOptionRow,
} from "./FilterSectionComponents";
import { FilterActiveChips } from "./FilterActiveChips";

export { SideSection, FilterOptionRow, RadioOptionRow };

export function ProductFilterSidebar({
  allProducts,
  scale,
  onScaleChange,
  scaleOptions,
  brand,
  onBrandChange,
  brandOptions,
  vehicle,
  onVehicleChange,
  vehicleOptions,
  priceRange,
  onPriceRangeChange,
  hasActiveFilters,
  onResetFilters,
  openSections,
  onToggleSection,
}: {
  allProducts: Product[];
  scale: ScaleFilter;
  onScaleChange: (v: ScaleFilter) => void;
  scaleOptions?: string[];
  brand: string;
  onBrandChange: (v: string) => void;
  brandOptions: string[];
  vehicle: VehicleFilter;
  onVehicleChange: (v: VehicleFilter) => void;
  vehicleOptions?: string[];
  priceRange: PriceRangeKey;
  onPriceRangeChange: (v: PriceRangeKey) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  openSections: Record<SideSectionKey, boolean>;
  onToggleSection: (key: SideSectionKey) => void;
}) {
  const [brandSearch, setBrandSearch] = useState("");

  const scaleList = [
    { key: "all" as ScaleFilter, label: "Tất cả" },
    ...(scaleOptions && scaleOptions.length > 0
      ? scaleOptions
      : ["1:64", "1:32", "1:16"]
    ).map((s) => ({
      key: s as ScaleFilter,
      label: s,
    })),
  ];

  const vehicleList = [
    { key: "all" as VehicleFilter, label: "Tất cả" },
    ...(vehicleOptions && vehicleOptions.length > 0
      ? vehicleOptions
      : ["Ô tô", "Xe máy", "Xe bán tải"]
    ).map((v) => ({
      key: v as VehicleFilter,
      label: v,
    })),
  ];

  const countForScale = (key: ScaleFilter) =>
    key === "all" ? allProducts.length : allProducts.filter((p) => p.scale === key).length;

  const countForVehicle = (key: VehicleFilter) =>
    key === "all" ? allProducts.length : allProducts.filter((p) => p.vehicleType === key).length;

  const countForBrand = (b: string) =>
    b === "all" ? allProducts.length : allProducts.filter((p) => p.brand === b).length;

  const effectivePrice = (p: Product) =>
    p.promoPrice && p.promoPrice < p.price ? p.promoPrice : p.price;

  const countForPriceRange = (range: (typeof PRICE_RANGES)[number]) => {
    if (range.key === "all") return allProducts.length;
    return allProducts.filter((p) => range.test(effectivePrice(p))).length;
  };

  const selectedCriteriaCount =
    (scale !== "all" ? 1 : 0) +
    (brand !== "all" ? 1 : 0) +
    (vehicle !== "all" ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0);

  const filteredBrands = brandSearch.trim()
    ? brandOptions.filter((b) => b.toLowerCase().includes(brandSearch.trim().toLowerCase()))
    : brandOptions;

  const currentPriceRangeLabel = PRICE_RANGES.find((r) => r.key === priceRange)?.label || "";

  return (
    <aside
      aria-label="Bộ lọc sản phẩm"
      className="order-1 min-w-0 lg:sticky lg:top-[5.5rem] lg:self-start"
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-sm lg:flex lg:max-h-[calc(100dvh-6.5rem)] lg:flex-col">
        {/* Header Bộ lọc + Nút xóa nhanh */}
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--border)]/70 pb-3">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-[var(--accent)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <h2 className="text-base font-bold tracking-tight">Bộ lọc</h2>
            {selectedCriteriaCount > 0 && (
              <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-bold text-white">
                {selectedCriteriaCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Các chip tiêu chí đang lọc */}
        {hasActiveFilters && (
          <FilterActiveChips
            scale={scale}
            onScaleChange={onScaleChange}
            brand={brand}
            onBrandChange={onBrandChange}
            vehicle={vehicle}
            onVehicleChange={onVehicleChange}
            priceRange={priceRange}
            onPriceRangeChange={onPriceRangeChange}
            currentPriceRangeLabel={currentPriceRangeLabel}
          />
        )}

        {/* Nội dung các mục lọc (cuộn mượt trên máy tính) */}
        <div className="flex-1 lg:overflow-y-auto lg:pr-1">
          {/* Mục 1: Tỉ lệ */}
          <SideSection
            panelId="filter-panel-scale"
            title="Tỉ lệ"
            badge={scale !== "all" ? scale : null}
            open={openSections.scale}
            onToggle={() => onToggleSection("scale")}
          >
            <div
              role="group"
              aria-label="Lọc theo tỉ lệ"
              className="grid grid-cols-4 gap-1.5 pt-1"
            >
              {scaleList.map((s) => {
                const active = scale === s.key;
                const count = countForScale(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => onScaleChange(s.key)}
                    aria-pressed={active}
                    aria-label={`Tỉ lệ ${s.label}, ${count} mẫu`}
                    title={`${s.label} (${count} xe)`}
                    className={`flex flex-col items-center justify-center rounded-xl px-1 py-2 text-center transition-all cursor-pointer ${
                      active
                        ? "bg-[var(--accent)] text-white shadow-xs font-bold"
                        : "border border-[var(--border)] bg-[var(--surface2)]/60 text-[var(--text)] hover:bg-[var(--surface2)] font-medium"
                    }`}
                  >
                    <span className="text-xs sm:text-[13px]">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </SideSection>

          {/* Mục 2: Hãng xe */}
          <SideSection
            panelId="filter-panel-brand"
            title="Hãng xe"
            badge={brand !== "all" ? brand : null}
            open={openSections.brand}
            onToggle={() => onToggleSection("brand")}
            className={openSections.brand ? "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col" : ""}
            contentClassName="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
          >
            {brandOptions.length > 6 && (
              <div className="relative mb-2">
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Tìm hãng xe..."
                  aria-label="Tìm kiếm hãng xe"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface2)]/60 py-1.5 pl-8 pr-7 text-xs text-[var(--text)] placeholder-[var(--dim)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                />
                <svg
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--dim)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {brandSearch && (
                  <button
                    type="button"
                    onClick={() => setBrandSearch("")}
                    aria-label="Xóa từ khóa tìm hãng xe"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--dim)] hover:text-[var(--text)] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            <div
              role="radiogroup"
              aria-label="Lọc theo hãng xe"
              className="max-h-60 space-y-1 overflow-y-auto pr-1 lg:max-h-none lg:min-h-0 lg:flex-1"
            >
              <RadioOptionRow
                label="Tất cả"
                count={countForBrand("all")}
                active={brand === "all"}
                onClick={() => onBrandChange("all")}
                ariaLabel={`Tất cả hãng xe, ${allProducts.length} mẫu`}
              />
              {filteredBrands.map((b) => (
                <RadioOptionRow
                  key={b}
                  label={b}
                  count={countForBrand(b)}
                  active={brand === b}
                  onClick={() => onBrandChange(b)}
                  ariaLabel={`Lọc theo hãng ${b}, ${countForBrand(b)} mẫu`}
                />
              ))}
              {filteredBrands.length === 0 && (
                <p className="py-2 text-center text-xs text-[var(--dim)]">Không tìm thấy hãng nào.</p>
              )}
            </div>
          </SideSection>

          {/* Mục 3: Loại xe */}
          <SideSection
            panelId="filter-panel-vehicle"
            title="Loại xe"
            badge={vehicle !== "all" ? vehicle : null}
            open={openSections.vehicle}
            onToggle={() => onToggleSection("vehicle")}
          >
            <div role="group" aria-label="Lọc theo loại xe" className="space-y-1">
              {vehicleList.map((v) => (
                <FilterOptionRow
                  key={v.key}
                  label={v.label}
                  count={countForVehicle(v.key)}
                  active={vehicle === v.key}
                  onClick={() => onVehicleChange(v.key)}
                  ariaLabel={`Lọc theo loại xe: ${v.label}, ${countForVehicle(v.key)} mẫu`}
                />
              ))}
            </div>
          </SideSection>

          {/* Mục 4: Khoảng giá */}
          <SideSection
            panelId="filter-panel-price"
            title="Khoảng giá (VNĐ)"
            badge={priceRange !== "all" ? currentPriceRangeLabel : null}
            open={openSections.price}
            onToggle={() => onToggleSection("price")}
          >
            <div role="group" aria-label="Lọc theo khoảng tiền" className="space-y-1">
              {PRICE_RANGES.map((r) => {
                const count = countForPriceRange(r);
                return (
                  <FilterOptionRow
                    key={r.key}
                    label={r.label}
                    count={count}
                    active={priceRange === r.key}
                    onClick={() => onPriceRangeChange(r.key)}
                    ariaLabel={`Lọc theo khoảng tiền: ${r.label}, ${count} mẫu`}
                  />
                );
              })}
            </div>
          </SideSection>
        </div>

        {/* Footer thanh bộ lọc */}
        <div className="mt-2 flex shrink-0 items-center justify-between gap-3 border-t border-[var(--border)]/70 px-1 pt-3">
          <button
            type="button"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            aria-label="Xóa bộ lọc — đặt lại tất cả bộ lọc"
            className="rounded-xl border border-[var(--border)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--dim)] hover:bg-[var(--surface2)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[var(--border)] cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
          <p role="status" aria-live="polite" className="text-xs text-[var(--dim)]">
            {selectedCriteriaCount > 0 ? `${selectedCriteriaCount} tiêu chí đã chọn` : "Mặc định (Tất cả)"}
          </p>
        </div>
      </div>
    </aside>
  );
}
