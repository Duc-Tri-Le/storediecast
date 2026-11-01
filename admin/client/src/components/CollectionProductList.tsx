import { useState, useMemo } from "react";
import type { Product } from "../types";
import type { CollectionKind, MatchMode } from "../utils/collectionRules";
import { fmtVND, totalStock, defaultVariant } from "../utils/format";
import { Icon, Thumb, ICONS } from "./shared";
import { CollectionProductTable } from "./CollectionProductTable";

export type CollectionSortKey =
  | "manual"
  | "titleAsc"
  | "titleDesc"
  | "priceDesc"
  | "priceAsc"
  | "newest"
  | "oldest";

export function CollectionProductList({
  mode,
  sortKey,
  onSortChange,
  products,
  manualIds,
  onAddManual,
  onRemoveManual,
  onBulkRemove,
  onMoveManual,
  onOpenProduct,
  displayedProducts,
  sortedProducts,
  positionIndexOf,
  autoMatchedCount,
  matchMode,
  title,
}: {
  mode: CollectionKind;
  sortKey: CollectionSortKey;
  onSortChange: (k: CollectionSortKey) => void;
  products: Product[];
  manualIds: number[];
  onAddManual: (id: number) => void;
  onRemoveManual: (id: number) => void;
  onBulkRemove: (ids: number[]) => void;
  onMoveManual: (i: number, dir: -1 | 1) => void;
  onOpenProduct?: (p: Product) => void;
  displayedProducts: Product[];
  sortedProducts: Product[];
  positionIndexOf: Map<number, number>;
  autoMatchedCount: number;
  matchMode: MatchMode;
  title: string;
}) {
  const [addSearch, setAddSearch] = useState("");
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<number>>(new Set());

  const addResults = useMemo(() => {
    const q = addSearch.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => !manualIds.includes(p.id))
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.scale.includes(q),
      )
      .slice(0, 8);
  }, [addSearch, products, manualIds]);

  const selectCls =
    "rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-[var(--accent)] shadow-2xs";

  const allSelected =
    displayedProducts.length > 0 &&
    displayedProducts.every((p) => checkedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(displayedProducts.map((p) => p.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh công cụ: Sắp xếp + Thống kê */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--table-head)]/30 p-3.5 sm:p-4">
        <div className="flex items-center gap-2.5">
          <label htmlFor="cd-sort" className="text-xs font-semibold text-[var(--dim)]">
            Sắp xếp:
          </label>
          <select
            id="cd-sort"
            aria-label="Sắp xếp sản phẩm trong bộ"
            className={selectCls}
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as CollectionSortKey)}
          >
            <option value="manual">Thủ công (theo thứ tự sắp xếp)</option>
            <option value="titleAsc">Tên sản phẩm A → Z</option>
            <option value="titleDesc">Tên sản phẩm Z → A</option>
            <option value="priceDesc">Giá cao nhất trước</option>
            <option value="priceAsc">Giá thấp nhất trước</option>
            <option value="newest">Mới nhất trước</option>
            <option value="oldest">Cũ nhất trước</option>
          </select>
        </div>

        <div className="text-xs">
          {mode === "manual" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1 font-medium text-[var(--dim)] shadow-2xs">
              Tổng cộng: <strong className="text-[var(--text)] font-bold">{displayedProducts.length}</strong> sản phẩm
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1 font-medium text-[var(--dim)] shadow-2xs">
              Tự động khớp: <strong className="text-[var(--accent)] font-bold">{autoMatchedCount}</strong> sản phẩm ({matchMode === "all" ? "tất cả ĐK" : "bất kỳ ĐK"})
            </span>
          )}
        </div>
      </div>

      {/* Ô tìm kiếm & thêm sản phẩm nhanh ở chế độ thủ công */}
      {mode === "manual" && (
        <div className="relative">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--dim)]">
              <Icon d={ICONS.search} size={15} />
            </span>
            <input
              type="search"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              placeholder="Nhập tên xe, hãng xe, tỉ lệ để tìm và thêm vào bộ…"
              aria-label="Tìm sản phẩm để thêm vào bộ"
              className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pr-3 pl-9 text-xs outline-none transition placeholder:text-[var(--dim)] focus:border-[var(--accent)] shadow-2xs"
            />
          </div>

          {addSearch.trim() && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-white p-2 shadow-xl">
              {addResults.length === 0 ? (
                <p className="p-3 text-center text-xs text-[var(--dim)]">
                  Không tìm thấy sản phẩm nào khả dụng để thêm.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {addResults.map((p) => {
                    const v = defaultVariant(p);
                    return (
                      <li
                        key={p.id}
                        className="flex items-center gap-3 p-2 hover:bg-[var(--sidebar)] rounded-lg transition"
                      >
                        <Thumb product={p} size={36} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-[var(--text)]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-[var(--dim)]">
                            {p.brand} · Tỉ lệ {p.scale} · {v ? fmtVND(v.promoPrice || v.price) : "—"} · Tồn {totalStock(p)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onAddManual(p.id);
                            setAddSearch("");
                          }}
                          className="shrink-0 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-dark)] transition"
                        >
                          + Thêm vào bộ
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Thanh thao tác nhóm (Bulk actions bar khi có chọn checkbox) */}
      {mode === "manual" && checkedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-soft)]/50 p-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-[var(--accent-dark)]">
            <span>Đã chọn <strong>{checkedIds.size}</strong> / {displayedProducts.length} sản phẩm</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onBulkRemove(Array.from(checkedIds));
                setCheckedIds(new Set());
              }}
              className="rounded-lg bg-[#c5221f] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#a51b18] transition"
            >
              Bỏ khỏi bộ ({checkedIds.size})
            </button>
            <button
              type="button"
              onClick={() => setCheckedIds(new Set())}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--dim)] hover:text-[var(--text)] transition"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Bảng danh sách sản phẩm trong bộ */}
      <CollectionProductTable
        mode={mode}
        sortKey={sortKey}
        displayedProducts={displayedProducts}
        sortedProducts={sortedProducts}
        positionIndexOf={positionIndexOf}
        checkedIds={checkedIds}
        setCheckedIds={setCheckedIds}
        allSelected={allSelected}
        toggleSelectAll={toggleSelectAll}
        onOpenProduct={onOpenProduct}
        onMoveManual={onMoveManual}
        onRemoveManual={onRemoveManual}
        title={title}
      />
    </div>
  );
}
