import { useState } from "react";
import type { Product, ShopCollection, CatalogData, Order } from "../types";
import type { CollectionKind } from "../utils/collectionRules";
import {
  Icon,
  ICONS,
  BulkDeleteBar,
  BulkDeleteConfirmDialog,
} from "../components/shared";
import { CollectionDetailPage } from "./CollectionDetailPage";
import { ProductDetailPage } from "./ProductDetailPage";
import { CollectionCreator } from "../components/CollectionCreator";
import { CollectionTable } from "../components/CollectionTable";
import { useCollectionsData } from "../hooks/useCollectionsData";

export function CollectionsPage({
  products,
  loading,
  collections,
  collectionsError,
  catalog,
  orders,
  onViewScale,
  onViewBrand,
  onViewType,
}: {
  products: Product[];
  loading: boolean;
  collections: ShopCollection[];
  collectionsError: string | null;
  catalog: CatalogData | null;
  orders: Order[];
  onViewScale: (scale: string) => void;
  onViewBrand: (brand: string) => void;
  onViewType: (vehicleType: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [detailProductId, setDetailProductId] = useState<number | null>(null);

  const {
    tab,
    setTab,
    search,
    setSearch,
    sort,
    setSort,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedRowIds,
    setSelectedRowIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    notice,
    setNotice,
    counts,
    visible,
    selectedCollectionRows,
    deletableVisible,
    allDeletableVisibleSelected,
    toggleCollectionSelected,
    toggleSelectAllCollections,
    selectedRow,
    toggleStatus,
    deleteCustom,
    bulkDeleteMut,
  } = useCollectionsData({ products, collections, catalog, orders });

  const detailProduct =
    detailProductId != null
      ? (products.find((p) => p.id === detailProductId) ?? null)
      : null;

  if (detailProduct) {
    return (
      <ProductDetailPage
        key={detailProduct.id}
        product={detailProduct}
        allProducts={products}
        collections={collections}
        catalog={catalog}
        backLabel="Bộ sưu tập"
        onBack={() => setDetailProductId(null)}
        onSaved={() => setDetailProductId(null)}
        onDeleted={() => setDetailProductId(null)}
        onDuplicated={() => setDetailProductId(null)}
      />
    );
  }

  if (selectedRow && selectedRow.custom) {
    return (
      <CollectionDetailPage
        key={selectedRow.custom.id}
        row={selectedRow}
        collection={selectedRow.custom}
        products={products}
        catalog={catalog}
        onBack={() => setSelectedId(null)}
        onDeleted={(msg) => {
          setSelectedId(null);
          setNotice(msg);
        }}
        onViewNav={(nav) => {
          if (nav.kind === "scale") onViewScale(nav.value);
          else if (nav.kind === "brand") onViewBrand(nav.value);
          else onViewType(nav.value);
        }}
        onOpenProduct={(p) => setDetailProductId(p.id)}
      />
    );
  }

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
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Icon d={ICONS.plus} size={15} /> Tạo bộ sưu tập
        </button>
      </div>

      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">
          {notice}
        </p>
      )}
      {collectionsError && (
        <p className="mt-4 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          Không tải được bộ sưu tập tự tạo từ database chung: {collectionsError}
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
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-1 pt-3 pb-2 text-sm whitespace-nowrap ${
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bộ sưu tập"
              aria-label="Tìm kiếm bộ sưu tập"
              className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)]"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">Sắp xếp bộ sưu tập</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
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
        {!loading && visible.length === 0 && (
          <div className="px-4 py-10 text-center">
            {tab === "manual" && counts.manual === 0 && !search ? (
              <>
                <p className="text-sm text-[var(--dim)]">
                  Chưa có bộ sưu tập tự tạo nào. Tạo một bộ ở đây rồi thêm sản phẩm vào —
                  bộ sẽ hiện thành thẻ tag ở trang chi tiết của từng sản phẩm đó.
                </p>
                <button
                  type="button"
                  onClick={() => setCreating(true)}
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

        {visible.length > 0 && (
          <CollectionTable
            visible={visible}
            selectedId={selectedId}
            selectedRowIds={selectedRowIds}
            confirmDeleteId={confirmDeleteId}
            allDeletableVisibleSelected={allDeletableVisibleSelected}
            deletableVisibleCount={deletableVisible.length}
            onSelectRow={setSelectedId}
            onToggleSelectAll={toggleSelectAllCollections}
            onToggleSelectRow={toggleCollectionSelected}
            onOpenDetail={setSelectedId}
            onToggleStatus={toggleStatus}
            onConfirmDelete={setConfirmDeleteId}
            onCancelDelete={() => setConfirmDeleteId(null)}
            onDeleteDirect={deleteCustom}
          />
        )}
      </div>

      <BulkDeleteBar
        count={selectedCollectionRows.length}
        unit="bộ sưu tập"
        deleting={bulkDeleteMut.isPending}
        onDelete={() => setConfirmBulkDelete(true)}
        onClear={() => setSelectedRowIds(new Set())}
      />

      {confirmBulkDelete && selectedCollectionRows.length > 0 && (
        <BulkDeleteConfirmDialog
          title={`Xóa ${selectedCollectionRows.length} bộ sưu tập đã chọn?`}
          names={selectedCollectionRows.map((r) => r.title)}
          consequence="Chỉ bộ sưu tập tự tạo và quan hệ của chúng với sản phẩm bị xóa — sản phẩm trong bộ vẫn giữ nguyên, chỉ mất thẻ tag của bộ đã xóa. 3 bộ theo tỉ lệ không nằm trong danh sách này và không bị xóa."
          deleting={bulkDeleteMut.isPending}
          onConfirm={() =>
            bulkDeleteMut.mutate(
              selectedCollectionRows
                .map((r) => r.custom?.id)
                .filter((x): x is number => x != null),
            )
          }
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}

      <p className="mt-3 text-xs leading-5 text-[var(--dim)]">
        Cột Điều kiện hiện đúng các điều kiện đã lưu của từng bộ — sửa điều kiện ở trang
        chi tiết bộ rồi bấm Lưu là danh sách sản phẩm của bộ tính lại theo điều kiện mới.
      </p>

      {creating && (
        <CollectionCreator
          products={products}
          catalog={catalog}
          onClose={() => setCreating(false)}
          onCreated={(created) => {
            setCreating(false);
            setTab("all");
            setSelectedId(`custom-${created.id}`);
            setNotice(
              `Đã tạo bộ sưu tập “${created.title}” (${created.status === "published" ? "Đã đăng" : "Nháp"}) trong database chung — mở chi tiết bộ để xem sản phẩm trong bộ.`,
            );
          }}
        />
      )}
    </div>
  );
}
