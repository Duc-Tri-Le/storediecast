import type { CatalogData, Product, ShopCollection, Variant } from "../types";
import { BulkDeleteBar, BulkDeleteConfirmDialog, Icon, ICONS } from "../components/shared";
import { InventoryTable } from "../components/InventoryTable";
import { Pagination } from "../components/Pagination";
import {
  PAGE_SIZE,
  type StockFilter,
  useInventoryState,
} from "../hooks/useInventoryState";

export type { StockFilter };

export function InventoryPage({
  products: _fallbackProducts,
  loading: _fallbackLoading,
  error: _fallbackError,
  collections: _collections,
  catalog: _catalog,
  onGoProducts,
  onOpenProduct,
  routePageNumber = 1,
  routeFilter = "all",
  routeSearch = "",
  routeSortDir = "asc",
  onNavigateRoute,
}: {
  products: Product[];
  loading: boolean;
  error: string | null;
  collections: ShopCollection[];
  catalog: CatalogData | null;
  onGoProducts: () => void;
  onOpenProduct: (id: number) => void;
  routePageNumber?: number;
  routeFilter?: string;
  routeSearch?: string;
  routeSortDir?: "asc" | "desc";
  onNavigateRoute?: (params: {
    pageNumber?: number;
    filter?: string;
    search?: string;
    sortDir?: "asc" | "desc";
  }) => void;
}) {
  const {
    search,
    filter,
    sortDir,
    currentPage,
    handleFilterChange,
    handleSearchChange,
    handleSortDirChange,
    handlePageChange,
    paginatedRows,
    total,
    totalPages,
    counts,
    loading,
    error,
    drafts,
    setDrafts,
    selected,
    setSelected,
    confirmBulkDelete,
    setConfirmBulkDelete,
    notice,
    saveMut,
    deleteVariantsMut,
    selectedRows,
    targetFor,
    stepDraft,
    saveRow,
    visibleIds,
    allVisibleSelected,
    toggleSelect,
  } = useInventoryState({
    routePageNumber,
    routeFilter,
    routeSearch,
    routeSortDir,
    onNavigateRoute,
  });

  const renderUpdateControls = (product: Product, variant: Variant) => {
    const rawDraft = drafts[variant.id];
    const dirty = rawDraft !== undefined;
    const target = targetFor(variant);
    const stockErr =
      dirty && target == null
        ? "Số lượng phải là số nguyên ≥ 0"
        : dirty && target != null && target < 0
          ? "Số lượng không được âm"
          : null;

    return (
      <div>
        {stockErr && (
          <span className="block text-[10px] text-[#c0392b] font-semibold leading-tight mb-1">
            {stockErr}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`flex w-fit items-center overflow-hidden rounded-lg border transition ${
              stockErr ? "border-[#c0392b] bg-[#fff8f8]" : "border-[var(--border)]"
            }`}
            role="group"
            aria-label={`Cập nhật số lượng ${product.name} màu ${variant.colorName}`}
          >
            <button
              type="button"
              aria-label={`Giảm 1 số lượng cho ${product.name} màu ${variant.colorName}`}
              onClick={() => stepDraft(variant, -1)}
              className="px-3 py-1.5 text-base leading-6 font-semibold text-[var(--text)] transition-colors hover:bg-[var(--sidebar)]"
            >
              −
            </button>
            <input
              type="text"
              inputMode="numeric"
              aria-label={`Số lượng cập nhật cho ${product.name} màu ${variant.colorName}`}
              placeholder="0"
              value={drafts[variant.id] ?? String(variant.stock)}
              onChange={(e) =>
                setDrafts((d) => ({ ...d, [variant.id]: e.target.value }))
              }
              className={`w-[68px] border-x px-2 py-1.5 text-center text-sm outline-none transition ${
                stockErr
                  ? "border-[#c0392b] bg-[#fff8f8] text-[#c0392b]"
                  : "border-[var(--border)] bg-[var(--sidebar)] focus:border-[var(--accent)] focus:bg-white text-[var(--text)]"
              }`}
            />
            <button
              type="button"
              aria-label={`Tăng 1 số lượng cho ${product.name} màu ${variant.colorName}`}
              onClick={() => stepDraft(variant, 1)}
              className="px-3 py-1.5 text-base leading-6 font-semibold text-[var(--text)] transition-colors hover:bg-[var(--sidebar)]"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={!dirty || stockErr != null || saveMut.isPending}
            onClick={() => saveRow(product, variant)}
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium whitespace-nowrap hover:bg-[var(--sidebar)] disabled:opacity-40"
          >
            Lưu
          </button>
        </div>
        {target != null && !stockErr && (
          <p className="mt-1 text-xs text-[var(--dim)]">
            {dirty ? `Số lượng mới → sẽ thành ${target} chiếc` : "Đang bằng tồn hiện tại"}
          </p>
        )}
      </div>
    );
  };

  const tabs: Array<{ key: StockFilter; label: string; count: number }> = [
    { key: "all", label: "Tất cả", count: counts.all },
    { key: "in", label: "Còn hàng", count: counts.in },
    { key: "low", label: "Sắp hết", count: counts.low },
    { key: "out", label: "Hết hàng", count: counts.out },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Tồn kho</h1>
        <button
          type="button"
          onClick={onGoProducts}
          className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
        >
          Xem sản phẩm
        </button>
        <p className="ml-auto text-sm text-[var(--dim)]">
          {total} biến thể · Trang {currentPage}/{totalPages}
        </p>
      </div>

      <div
        className="mt-5 flex gap-4 border-b border-[var(--border)]"
        role="tablist"
        aria-label="Lọc tồn kho"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={filter === t.key}
            onClick={() => handleFilterChange(t.key)}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === t.key
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--dim)] hover:text-[var(--text)]"
            }`}
          >
            {t.label} ({t.count})
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
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm biến thể theo tên xe, màu, SKU"
            aria-label="Tìm kiếm biến thể"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--sidebar)] py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)] focus:bg-white"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Bộ lọc tồn kho</span>
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as StockFilter)}
            aria-label="Bộ lọc tồn kho"
            className="rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="all">Tất cả trạng thái tồn</option>
            <option value="in">Còn hàng</option>
            <option value="low">Sắp hết (còn ≤ 3)</option>
            <option value="out">Hết hàng</option>
          </select>
        </label>
      </div>

      <BulkDeleteBar
        count={selectedRows.length}
        unit="biến thể màu"
        deleting={deleteVariantsMut.isPending}
        onDelete={() => setConfirmBulkDelete(true)}
        onClear={() => setSelected([])}
      />

      {confirmBulkDelete && selectedRows.length > 0 && (
        <BulkDeleteConfirmDialog
          title={`Xóa ${selectedRows.length} biến thể màu đã chọn?`}
          names={selectedRows.map(
            ({ product, variant }) =>
              `${product.name} — màu ${variant.colorName}${variant.sku ? ` (SKU ${variant.sku})` : ""}`,
          )}
          consequence="Các biến thể màu trên sẽ bị xóa khỏi sản phẩm của chúng; sản phẩm nào bị xóa hết biến thể thì sản phẩm đó cũng bị xóa hẳn."
          deleting={deleteVariantsMut.isPending}
          onConfirm={() =>
            deleteVariantsMut.mutate(selectedRows.map((r) => r.variant.id))
          }
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}

      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">{notice}</p>
      )}
      {loading && <p className="mt-6 text-sm text-[var(--dim)]">Đang tải tồn kho…</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Không tải được tồn kho: {error}
        </p>
      )}
      {!loading && !error && paginatedRows.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--dim)]">
          Không có biến thể nào khớp.
        </p>
      )}

      {paginatedRows.length > 0 && (
        <>
          <InventoryTable
            rows={paginatedRows}
            selected={selected}
            allVisibleSelected={allVisibleSelected}
            sortDir={sortDir}
            setSortDir={handleSortDirChange}
            toggleSelectAll={(checked) =>
              setSelected((s) =>
                checked ? [...new Set([...s, ...visibleIds])] : s.filter((id) => !visibleIds.includes(id)),
              )
            }
            toggleSelect={toggleSelect}
            onOpenDetail={(id) => onOpenProduct(id)}
            renderUpdateControls={renderUpdateControls}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            itemUnit="biến thể"
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
