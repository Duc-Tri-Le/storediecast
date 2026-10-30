import { Chip, Icon, ICONS } from "./shared";

export type ProductTab = "all" | "in" | "out";
export type ProductSort = "default" | "nameAsc" | "nameDesc" | "priceDesc" | "priceAsc";

export function ProductFilterBar({
  tabs,
  tab,
  onTabChange,
  counts,
  search,
  onSearchChange,
  sort,
  onSortChange,
  scaleFilter,
  onClearScaleFilter,
  extraFilter,
  onClearExtraFilter,
}: {
  tabs: Array<[ProductTab, string]>;
  tab: ProductTab;
  onTabChange: (t: ProductTab) => void;
  counts: { all: number; in: number; out: number };
  search: string;
  onSearchChange: (s: string) => void;
  sort: ProductSort;
  onSortChange: (s: ProductSort) => void;
  scaleFilter: string | null;
  onClearScaleFilter: () => void;
  extraFilter: { kind: "brand" | "vehicleType"; value: string } | null;
  onClearExtraFilter: () => void;
}) {
  return (
    <>
      <div
        className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-b border-[var(--border)]"
        role="tablist"
        aria-label="Lọc sản phẩm"
      >
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => onTabChange(key)}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm whitespace-nowrap ${
              tab === key
                ? "border-[var(--accent)] font-semibold text-[var(--accent)]"
                : "border-transparent text-[var(--dim)] hover:text-[var(--text)]"
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--dim)]">
            <Icon d={ICONS.search} size={16} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm sản phẩm theo tên, hãng xe, hãng mô hình, SKU"
            aria-label="Tìm kiếm sản phẩm"
            className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)]"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Sắp xếp sản phẩm</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ProductSort)}
            aria-label="Sắp xếp sản phẩm"
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] sm:w-auto"
          >
            <option value="default">Mặc định</option>
            <option value="nameAsc">Tên A-Z</option>
            <option value="nameDesc">Tên Z-A</option>
            <option value="priceDesc">Giá cao-thấp</option>
            <option value="priceAsc">Giá thấp-cao</option>
          </select>
        </label>
      </div>

      {scaleFilter && (
        <p className="mt-3 flex items-center gap-2 text-sm">
          <Chip tone="blue">Bộ sưu tập {scaleFilter}</Chip>
          <button
            type="button"
            onClick={onClearScaleFilter}
            className="text-[var(--accent)] underline"
          >
            Bỏ lọc theo bộ sưu tập
          </button>
        </p>
      )}

      {extraFilter && (
        <p className="mt-3 flex items-center gap-2 text-sm">
          <Chip tone="blue">
            {extraFilter.kind === "brand"
              ? `Hãng bằng ${extraFilter.value}`
              : `Loại xe bằng ${extraFilter.value}`}
          </Chip>
          <button
            type="button"
            onClick={onClearExtraFilter}
            className="text-[var(--accent)] underline"
          >
            Bỏ lọc theo bộ sưu tập
          </button>
        </p>
      )}
    </>
  );
}

