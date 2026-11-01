import type { CatalogData, Product } from "../types";
import type { CollectionKind, CollectionRow } from "../utils/collectionRules";
import {
  BulkDeleteBar,
  BulkDeleteConfirmDialog,
  Icon,
  ICONS,
} from "./shared";
import { CollectionTable } from "./CollectionTable";
import { Pagination } from "./Pagination";
import { CollectionCreator } from "./CollectionCreator";

export interface CollectionsPageListViewProps {
  onAddNew: () => void;
  creating: boolean;
  onCloseCreating: () => void;
  onCreated: (c: { id: number; title: string }) => void;
  products: Product[];
  catalog: CatalogData | null;
  notice: string | null;
  collectionsError: string | null;
  tab: "all" | CollectionKind;
  onTabChange: (t: "all" | CollectionKind) => void;
  counts: Record<"all" | CollectionKind, number>;
  search: string;
  onSearchChange: (s: string) => void;
  sort: string;
  onSortChange: (s: string) => void;
  loading: boolean;
  visibleCount: number;
  paginatedVisible: CollectionRow[];
  selectedId: string | null;
  selectedRowIds: ReadonlySet<string>;
  confirmDeleteId: string | null;
  allDeletableVisibleSelected: boolean;
  deletableVisibleCount: number;
  onSelectCollection: (id: string | null) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectRow: (row: CollectionRow, checked: boolean) => void;
  onToggleStatus: (row: CollectionRow) => void;
  onConfirmDelete: (id: string | null) => void;
  onDeleteDirect: (row: CollectionRow) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  selectedCollectionRows: CollectionRow[];
  isBulkDeleting: boolean;
  confirmBulkDelete: boolean;
  setConfirmBulkDelete: (v: boolean) => void;
  onConfirmBulkDelete: () => void;
  onClearBulkSelected: () => void;
}

export function CollectionsPageListView({
  onAddNew,
  creating,
  onCloseCreating,
  onCreated,
  products,
  catalog,
  notice,
  collectionsError,
  tab,
  onTabChange,
  counts,
  search,
  onSearchChange,
  sort,
  onSortChange,
  loading,
  visibleCount,
  paginatedVisible,
  selectedId,
  selectedRowIds,
  confirmDeleteId,
  allDeletableVisibleSelected,
  deletableVisibleCount,
  onSelectCollection,
  onToggleSelectAll,
  onToggleSelectRow,
  onToggleStatus,
  onConfirmDelete,
  onDeleteDirect,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  selectedCollectionRows,
  isBulkDeleting,
  confirmBulkDelete,
  setConfirmBulkDelete,
  onConfirmBulkDelete,
  onClearBulkSelected,
}: CollectionsPageListViewProps) {
  const tabs: Array<["all" | CollectionKind, string]> = [
    ["all", "Tất cả"],
    ["manual", "Bộ sưu tập thủ công"],
    ["auto", "Bộ sưu tập tự động"],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold tracking-tight">Bộ sưu tập</h1>
        <button
          type="button"
          onClick={onAddNew}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Icon d={ICONS.plus} size={15} /> Tạo bộ sưu tập
        </button>
      </div>

      {creating && (
        <CollectionCreator
          products={products}
          catalog={catalog}
          onClose={onCloseCreating}
          onCreated={onCreated}
        />
      )}

      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">{notice}</p>
      )}
      {collectionsError && (
        <p className="mt-4 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Lỗi đồng bộ bộ sưu tập với database chung: {collectionsError}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)]">
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 border-b border-[var(--border)] px-4"
          role="tablist"
          aria-label="Loại bộ sưu tập"
        >
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => onTabChange(key)}
              className={`-mb-px border-b-2 px-1 pt-3 pb-2 text-sm whitespace-nowrap transition-colors ${
                tab === key
                  ? "border-[var(--accent)] font-semibold text-[var(--accent)]"
                  : "border-transparent text-[var(--dim)] hover:text-[var(--text)]"
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--dim)]">
              <Icon d={ICONS.search} size={16} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm bộ sưu tập"
              aria-label="Tìm kiếm bộ sưu tập"
              className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)]"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">Sắp xếp bộ sưu tập</span>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sắp xếp bộ sưu tập"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="best">Bán chạy nhất</option>
              <option value="countDesc">Số mẫu nhiều nhất</option>
              <option value="stockDesc">Tồn kho cao nhất</option>
              <option value="nameAsc">Tên A → Z</option>
              <option value="nameDesc">Tên Z → A</option>
              <option value="createdDesc">Tạo mới → cũ</option>
              <option value="createdAsc">Tạo cũ → mới</option>
            </select>
          </label>
        </div>

        {loading && (
          <p className="px-4 pb-6 text-sm text-[var(--dim)]">Đang tải bộ sưu tập…</p>
        )}
        {!loading && visibleCount === 0 && (
          <div className="px-4 py-10 text-center">
            {tab === "manual" && counts.manual === 0 && !search ? (
              <>
                <p className="text-sm text-[var(--dim)]">
                  Chưa có bộ sưu tập tự tạo nào. Tạo một bộ ở đây rồi thêm sản phẩm vào —
                  bộ sẽ hiện thành thẻ tag ở trang chi tiết của từng sản phẩm đó.
                </p>
                <button
                  type="button"
                  onClick={onAddNew}
                  className="mt-3 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
                >
                  Tạo bộ sưu tập thủ công
                </button>
              </>
            ) : (
              <p className="text-sm text-[var(--dim)]">Không có bộ sưu tập nào khớp.</p>
            )}
          </div>
        )}

        {visibleCount > 0 && (
          <>
            <CollectionTable
              visible={paginatedVisible}
              selectedId={selectedId}
              selectedRowIds={selectedRowIds}
              confirmDeleteId={confirmDeleteId}
              allDeletableVisibleSelected={allDeletableVisibleSelected}
              deletableVisibleCount={deletableVisibleCount}
              onSelectRow={onSelectCollection}
              onToggleSelectAll={onToggleSelectAll}
              onToggleSelectRow={onToggleSelectRow}
              onOpenDetail={onSelectCollection}
              onToggleStatus={onToggleStatus}
              onConfirmDelete={onConfirmDelete}
              onCancelDelete={() => onConfirmDelete(null)}
              onDeleteDirect={onDeleteDirect}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={visibleCount}
              pageSize={pageSize}
              itemUnit="bộ sưu tập"
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>

      <BulkDeleteBar
        count={selectedCollectionRows.length}
        unit="bộ sưu tập"
        deleting={isBulkDeleting}
        onDelete={() => setConfirmBulkDelete(true)}
        onClear={onClearBulkSelected}
      />

      {confirmBulkDelete && selectedCollectionRows.length > 0 && (
        <BulkDeleteConfirmDialog
          title={`Xóa ${selectedCollectionRows.length} bộ sưu tập đã chọn?`}
          names={selectedCollectionRows.map((r) => r.title)}
          consequence="Chỉ bộ sưu tập tự tạo và quan hệ của chúng với sản phẩm bị xóa — sản phẩm trong bộ vẫn giữ nguyên, chỉ mất thẻ tag của bộ đã xóa. 3 bộ theo tỉ lệ không nằm trong danh sách này và không bị xóa."
          deleting={isBulkDeleting}
          onConfirm={onConfirmBulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}

      <p className="mt-3 text-xs leading-5 text-[var(--dim)]">
        Cột Điều kiện hiện đúng các điều kiện đã lưu của từng bộ — sửa điều kiện ở trang
        chi tiết bộ rồi bấm Lưu là danh sách sản phẩm của bộ tính lại theo điều kiện mới.
      </p>
    </div>
  );
}
