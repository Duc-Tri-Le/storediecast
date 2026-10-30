import { type ReactNode } from "react";
import type { Product, ScaleFilter, VehicleFilter } from "../types";
import {
  SCALES,
  VEHICLES,
  PRICE_RANGES,
  type PriceRangeKey,
  type SideSectionKey,
} from "../data/filters";

export function SideSection({
  panelId,
  title,
  open,
  onToggle,
  dark = false,
  light = false,
  className = "",
  contentClassName = "",
  children,
}: {
  panelId: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  dark?: boolean;
  light?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${dark ? "border-b border-white/10 py-2 last:border-b-0" : light ? "border-b border-[var(--border)] py-2 last:border-b-0" : "py-1"} ${className}`}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Thu gọn" : "Mở rộng"} mục ${title}`}
          className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition ${
            dark
              ? "text-[15px] font-semibold text-white hover:bg-white/10"
              : light
                ? "text-[15px] font-semibold text-[var(--text)] hover:bg-[var(--surface2)]"
                : "text-sm font-bold uppercase tracking-wide text-[var(--text)] hover:bg-[var(--surface2)]"
          }`}
        >
          <span>{title}</span>
          <svg
            aria-hidden
            className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </h3>
      {open && (
        <div id={panelId} className={`px-1 pb-2 pt-1 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function FilterOptionRow({
  label,
  count,
  active,
  onClick,
  ariaLabel,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold transition ${
        active ? "bg-[var(--accent)] text-white" : "text-[var(--text)] hover:bg-[var(--surface2)]"
      }`}
    >
      <span className="min-w-0">{label}</span>
      {count != null && (
        <span
          aria-hidden
          className={`shrink-0 tabular-nums text-xs ${active ? "text-white/85" : "text-[var(--dim)]"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function RadioOptionRow({
  label,
  count,
  active,
  onClick,
  ariaLabel,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-1.5 py-[7px] text-left transition hover:bg-[var(--surface2)]"
    >
      <span
        aria-hidden
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border ${
          active ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--dim)]"
        }`}
      >
        {active && (
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      <span
        className={`min-w-0 flex-1 text-[15px] text-[var(--text)] ${
          active ? "font-semibold" : ""
        }`}
      >
        {label}
      </span>
      {count != null && (
        <span aria-hidden className="shrink-0 text-xs tabular-nums text-[var(--dim)]">
          {count}
        </span>
      )}
    </button>
  );
}

export function ProductFilterSidebar({
  allProducts,
  scale,
  onScaleChange,
  brand,
  onBrandChange,
  brandOptions,
  vehicle,
  onVehicleChange,
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
  brand: string;
  onBrandChange: (v: string) => void;
  brandOptions: string[];
  vehicle: VehicleFilter;
  onVehicleChange: (v: VehicleFilter) => void;
  priceRange: PriceRangeKey;
  onPriceRangeChange: (v: PriceRangeKey) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  openSections: Record<SideSectionKey, boolean>;
  onToggleSection: (key: SideSectionKey) => void;
}) {
  const countForScale = (key: ScaleFilter) =>
    key === "all" ? allProducts.length : allProducts.filter((p) => p.scale === key).length;
  const countForVehicle = (key: VehicleFilter) =>
    key === "all"
      ? allProducts.length
      : allProducts.filter((p) => p.vehicleType === key).length;
  const countForBrand = (b: string) => allProducts.filter((p) => p.brand === b).length;

  const selectedCriteriaCount =
    (scale !== "all" ? 1 : 0) +
    (brand !== "all" ? 1 : 0) +
    (vehicle !== "all" ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0);

  return (
    <aside
      aria-label="Bộ lọc sản phẩm"
      className="order-1 min-w-0 lg:sticky lg:top-[5.5rem] lg:self-start"
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-sm lg:flex lg:max-h-[calc(100dvh-6.5rem)] lg:flex-col">
        <SideSection
          panelId="filter-panel-scale"
          title="Tỉ lệ"
          light
          open={openSections.scale}
          onToggle={() => onToggleSection("scale")}
        >
          <div role="group" aria-label="Lọc theo tỉ lệ" className="flex flex-wrap gap-1.5 px-1 pt-1">
            {SCALES.map((s) => {
              const active = scale === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onScaleChange(s.key)}
                  aria-pressed={active}
                  aria-label={
                    s.key === "all"
                      ? `Tất cả tỉ lệ, ${countForScale(s.key)} mẫu`
                      : `Lọc theo tỉ lệ ${s.label}, ${countForScale(s.key)} mẫu`
                  }
                  className={`flex min-h-[44px] items-center rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface2)]"
                  }`}
                >
                  {s.key === "all" ? "Tất cả" : s.label}
                </button>
              );
            })}
          </div>
        </SideSection>

        <SideSection
          panelId="filter-panel-brand"
          title="Hãng xe"
          light
          open={openSections.brand}
          onToggle={() => onToggleSection("brand")}
          className={openSections.brand ? "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col" : ""}
          contentClassName="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
        >
          <div
            role="radiogroup"
            aria-label="Lọc theo hãng xe"
            className="max-h-80 overflow-y-auto pr-1 lg:max-h-none lg:min-h-0 lg:flex-1"
          >
            <RadioOptionRow
              label="Tất cả hãng"
              count={allProducts.length}
              active={brand === "all"}
              onClick={() => onBrandChange("all")}
              ariaLabel={`Tất cả hãng, ${allProducts.length} mẫu`}
            />
            {brandOptions.map((b) => (
              <RadioOptionRow
                key={b}
                label={b}
                count={countForBrand(b)}
                active={brand === b}
                onClick={() => onBrandChange(b)}
                ariaLabel={`Lọc theo hãng ${b}, ${countForBrand(b)} mẫu`}
              />
            ))}
          </div>
        </SideSection>

        <SideSection
          panelId="filter-panel-vehicle"
          title="Loại xe"
          light
          open={openSections.vehicle}
          onToggle={() => onToggleSection("vehicle")}
        >
          <div role="group" aria-label="Lọc theo loại xe">
            {VEHICLES.map((v) => (
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

        <SideSection
          panelId="filter-panel-price"
          title="Khoảng giá (VNĐ)"
          light
          open={openSections.price}
          onToggle={() => onToggleSection("price")}
        >
          <div role="group" aria-label="Lọc theo khoảng tiền">
            {PRICE_RANGES.map((r) => (
              <FilterOptionRow
                key={r.key}
                label={r.key === "all" ? "Tất cả" : r.label}
                active={priceRange === r.key}
                onClick={() => onPriceRangeChange(r.key)}
                ariaLabel={`Lọc theo khoảng tiền: ${r.label}`}
              />
            ))}
          </div>
        </SideSection>

        <div className="mt-1 flex shrink-0 items-center justify-between gap-3 border-t border-[var(--border)] px-1 pb-1 pt-3">
          <button
            type="button"
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            aria-label="Xóa bộ lọc — đặt lại tất cả bộ lọc"
            className="shrink-0 rounded-full border border-[var(--border)] px-4 py-2 text-[13px] font-semibold text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border)]"
          >
            Xóa bộ lọc
          </button>
          <p role="status" aria-live="polite" className="text-[13px] text-[var(--dim)]">
            {selectedCriteriaCount} tiêu chí đã chọn
          </p>
        </div>
      </div>
    </aside>
  );
}

