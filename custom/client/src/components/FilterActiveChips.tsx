import type { ScaleFilter, VehicleFilter } from "../types";
import type { PriceRangeKey } from "../data/filters";

export function FilterActiveChips({
  scale,
  onScaleChange,
  brand,
  onBrandChange,
  vehicle,
  onVehicleChange,
  priceRange,
  onPriceRangeChange,
  currentPriceRangeLabel,
}: {
  scale: ScaleFilter;
  onScaleChange: (v: ScaleFilter) => void;
  brand: string;
  onBrandChange: (v: string) => void;
  vehicle: VehicleFilter;
  onVehicleChange: (v: VehicleFilter) => void;
  priceRange: PriceRangeKey;
  onPriceRangeChange: (v: PriceRangeKey) => void;
  currentPriceRangeLabel: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-1.5 border-b border-[var(--border)]/70 pb-3">
      {scale !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface2)] px-2.5 py-1 text-xs font-medium text-[var(--text)]">
          Tỉ lệ: <strong className="font-semibold">{scale}</strong>
          <button
            type="button"
            onClick={() => onScaleChange("all")}
            aria-label="Bỏ lọc tỉ lệ"
            className="ml-0.5 text-[var(--dim)] hover:text-[var(--text)] cursor-pointer"
          >
            ✕
          </button>
        </span>
      )}
      {brand !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface2)] px-2.5 py-1 text-xs font-medium text-[var(--text)]">
          Hãng: <strong className="font-semibold">{brand}</strong>
          <button
            type="button"
            onClick={() => onBrandChange("all")}
            aria-label="Bỏ lọc hãng xe"
            className="ml-0.5 text-[var(--dim)] hover:text-[var(--text)] cursor-pointer"
          >
            ✕
          </button>
        </span>
      )}
      {vehicle !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface2)] px-2.5 py-1 text-xs font-medium text-[var(--text)]">
          Loại xe: <strong className="font-semibold">{vehicle}</strong>
          <button
            type="button"
            onClick={() => onVehicleChange("all")}
            aria-label="Bỏ lọc loại xe"
            className="ml-0.5 text-[var(--dim)] hover:text-[var(--text)] cursor-pointer"
          >
            ✕
          </button>
        </span>
      )}
      {priceRange !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface2)] px-2.5 py-1 text-xs font-medium text-[var(--text)]">
          Giá: <strong className="font-semibold">{currentPriceRangeLabel}</strong>
          <button
            type="button"
            onClick={() => onPriceRangeChange("all")}
            aria-label="Bỏ lọc khoảng giá"
            className="ml-0.5 text-[var(--dim)] hover:text-[var(--text)] cursor-pointer"
          >
            ✕
          </button>
        </span>
      )}
    </div>
  );
}

