import type { ScaleFilter, VehicleFilter } from "../types";
import { SORTS, type SortKey } from "../data/filters";

export function ProductQuickFilterToolbar({
  activeVehicleList,
  vehicleCounts,
  vehicle,
  onVehicleChange,
  activeScaleList,
  scaleCounts,
  scale,
  onScaleChange,
  allProductsCount,
  search,
  onSearchChange,
  sort,
  onSortChange,
  totalCount,
  gridLoading,
  view,
  setView,
  onResetToPage1,
}: {
  activeVehicleList: string[];
  vehicleCounts: Map<string, number>;
  vehicle: VehicleFilter;
  onVehicleChange: (v: VehicleFilter) => void;
  activeScaleList: string[];
  scaleCounts: Map<string, number>;
  scale: ScaleFilter;
  onScaleChange: (s: ScaleFilter) => void;
  allProductsCount: number;
  search: string;
  onSearchChange?: (s: string) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  totalCount: number;
  gridLoading: boolean;
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
  onResetToPage1: () => void;
}) {
  return (
    <div className="space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-xs">
      {/* Dải 1: Lọc nhanh theo Loại xe */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--dim)]">
          <span>Loại xe ({activeVehicleList.length + 1})</span>
          {vehicle !== "all" && (
            <button
              type="button"
              onClick={() => {
                onVehicleChange("all");
                onResetToPage1();
              }}
              className="text-[var(--accent)] hover:underline capitalize font-semibold cursor-pointer"
            >
              ✕ Đặt lại loại xe
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onVehicleChange("all");
              onResetToPage1();
            }}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              vehicle === "all"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "border border-[var(--border)] bg-[var(--surface2)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
            }`}
          >
            Tất cả loại ({allProductsCount})
          </button>
          {activeVehicleList.map((v) => {
            const count = vehicleCounts.get(v) || 0;
            const isActive = vehicle === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => {
                  onVehicleChange(v as VehicleFilter);
                  onResetToPage1();
                }}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "border border-[var(--border)] bg-[var(--surface2)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
                }`}
              >
                {v} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Dải 2: Lọc nhanh theo Tỉ lệ */}
      <div className="space-y-2 pt-2.5 border-t border-[var(--border)]/60">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--dim)]">
          <span>Tỉ lệ ({activeScaleList.length + 1})</span>
          {scale !== "all" && (
            <button
              type="button"
              onClick={() => {
                onScaleChange("all");
                onResetToPage1();
              }}
              className="text-[var(--accent)] hover:underline capitalize font-semibold cursor-pointer"
            >
              ✕ Đặt lại tỉ lệ
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onScaleChange("all");
              onResetToPage1();
            }}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              scale === "all"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "border border-[var(--border)] bg-[var(--surface2)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
            }`}
          >
            Tất cả tỉ lệ ({allProductsCount})
          </button>
          {activeScaleList.map((s) => {
            const count = scaleCounts.get(s) || 0;
            const isActive = scale === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onScaleChange(s as ScaleFilter);
                  onResetToPage1();
                }}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "border border-[var(--border)] bg-[var(--surface2)] text-[var(--dim)] hover:text-[var(--text)] hover:border-[var(--dim)]"
                }`}
              >
                Tỉ lệ {s} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Hàng 3: Ô tìm kiếm & Sắp xếp & Kiểu xem */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border)]/70">
        <div className="relative flex-1 max-w-xl">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dim)]">
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
            placeholder="Tìm mẫu xe theo tên, hãng, tỉ lệ, loại xe…"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface2)] pl-10 pr-9 py-2 text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--dim)] outline-none transition focus:border-[var(--accent)] shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange?.("")}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--dim)] hover:text-[var(--text)] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0">
          <span className="text-xs text-[var(--dim)] font-medium">
            {gridLoading ? "Đang tải…" : `${totalCount} sản phẩm`}
          </span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            aria-label="Sắp xếp theo"
            className="rounded-full border border-[var(--border)] bg-[var(--surface2)] px-4 py-2 text-xs sm:text-sm font-semibold outline-none focus:border-[var(--accent)] cursor-pointer transition shadow-2xs"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <div
            role="group"
            aria-label="Chọn kiểu xem: lưới hoặc danh sách"
            className="flex overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface2)]"
          >
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Xem dạng lưới"
              className={`grid h-8 w-9 place-items-center transition cursor-pointer ${
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
              className={`grid h-8 w-9 place-items-center transition cursor-pointer ${
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
  );
}

