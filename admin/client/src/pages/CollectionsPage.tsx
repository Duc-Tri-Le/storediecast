import { useState, useMemo, useEffect } from "react";
import type { CatalogData, Order, Product, ShopCollection } from "../types";
import type {
  CollectionKind,
  CollectionNav,
} from "../utils/collectionRules";
import { CollectionDetailPage } from "./CollectionDetailPage";
import { useCollectionsData } from "../hooks/useCollectionsData";
import { CollectionsPageListView } from "../components/CollectionsPageListView";

export function CollectionsPage({
  products,
  loading,
  collections,
  catalog,
  collectionsError,
  orders,
  onViewScale,
  onViewBrand,
  onViewType,
  onOpenProduct,
  routeIsNewCollection,
  routeCollectionId,
  onNavigateCreating,
  onNavigateCollection,
  routePageNumber = 1,
  routeTab = "all",
  routeSearch = "",
  routeSort = "best",
  onNavigateRoute,
}: {
  products: Product[];
  loading: boolean;
  collections: ShopCollection[];
  catalog: CatalogData | null;
  collectionsError: string | null;
  orders: Order[];
  onViewScale: (scale: string) => void;
  onViewBrand: (brand: string) => void;
  onViewType: (type: string) => void;
  onOpenProduct: (id: number) => void;
  routeIsNewCollection?: boolean;
  routeCollectionId?: string | number | null;
  onNavigateCreating?: (creating: boolean) => void;
  onNavigateCollection?: (collectionId: string | null) => void;
  routePageNumber?: number;
  routeTab?: string;
  routeSearch?: string;
  routeSort?: string;
  onNavigateRoute?: (params: {
    pageNumber?: number;
    tab?: string;
    search?: string;
    sort?: string;
  }) => void;
}) {
  const [creating, setCreating] = useState(Boolean(routeIsNewCollection));
  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPageLocal] = useState(routePageNumber || 1);

  useEffect(() => {
    if (routeIsNewCollection !== undefined) {
      setCreating(routeIsNewCollection);
    }
  }, [routeIsNewCollection]);

  const handleSetCreating = (val: boolean) => {
    setCreating(val);
    onNavigateCreating?.(val);
  };

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

  useEffect(() => {
    if (routePageNumber != null) setCurrentPageLocal(routePageNumber);
    if (routeTab != null && ["all", "manual", "auto"].includes(routeTab)) {
      setTab(routeTab as "all" | CollectionKind);
    }
    if (routeSearch !== undefined) setSearch(routeSearch);
    if (routeSort != null) setSort(routeSort);
  }, [routePageNumber, routeTab, routeSearch, routeSort, setTab, setSearch, setSort]);

  // Đồng bộ chi tiết bộ sưu tập từ URL khi routeCollectionId thay đổi
  useEffect(() => {
    if (routeCollectionId != null && routeCollectionId !== "") {
      const targetStr = String(routeCollectionId);
      const matched = visible.find((r) => {
        if (r.id === targetStr) return true;
        if (r.id === `custom-${targetStr}`) return true;
        if (r.custom && (String(r.custom.id) === targetStr || r.custom.slug === targetStr)) return true;
        if (r.isBase && (r.id === `base-scale-${targetStr}` || r.nav?.value === targetStr)) return true;
        return false;
      });
      if (matched) {
        setSelectedId(matched.id);
      } else {
        setSelectedId(targetStr);
      }
    } else {
      setSelectedId(null);
    }
  }, [routeCollectionId, visible, setSelectedId]);

  const handleSelectCollection = (id: string | null) => {
    if (!id) {
      setSelectedId(null);
      onNavigateCollection?.(null);
      return;
    }
    setSelectedId(id);
    const matched = visible.find((r) => r.id === id);
    const navId = matched?.custom?.id != null
      ? String(matched.custom.id)
      : id.replace(/^custom-/, "");
    onNavigateCollection?.(navId);
  };

  const updateRoute = (updates: {
    pageNumber?: number;
    tab?: string;
    search?: string;
    sort?: string;
  }) => {
    const nextTab = updates.tab !== undefined ? updates.tab : tab;
    const nextSearch = updates.search !== undefined ? updates.search : search;
    const nextSort = updates.sort !== undefined ? updates.sort : sort;
    const nextPage = updates.pageNumber !== undefined ? updates.pageNumber : 1;

    if (onNavigateRoute) {
      onNavigateRoute({
        pageNumber: nextPage,
        tab: nextTab,
        search: nextSearch,
        sort: nextSort,
      });
    }
  };

  const handleTabChange = (t: "all" | CollectionKind) => {
    setTab(t);
    setCurrentPageLocal(1);
    updateRoute({ tab: t, pageNumber: 1 });
  };

  const handleSearchChange = (s: string) => {
    setSearch(s);
    setCurrentPageLocal(1);
    updateRoute({ search: s, pageNumber: 1 });
  };

  const handleSortChange = (st: string) => {
    setSort(st);
    setCurrentPageLocal(1);
    updateRoute({ sort: st, pageNumber: 1 });
  };

  const handlePageChange = (p: number) => {
    setCurrentPageLocal(p);
    updateRoute({ pageNumber: p });
  };

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPageLocal(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedVisible = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return visible.slice(start, start + PAGE_SIZE);
  }, [visible, currentPage, PAGE_SIZE]);

  if (selectedRow && selectedRow.custom) {
    return (
      <CollectionDetailPage
        key={selectedRow.custom.id}
        row={selectedRow}
        collection={selectedRow.custom}
        products={products}
        catalog={catalog}
        onBack={() => handleSelectCollection(null)}
        onDeleted={(msg) => {
          handleSelectCollection(null);
          setNotice(msg);
        }}
        onViewNav={(nav: CollectionNav) => {
          if (nav.kind === "scale") onViewScale(nav.value);
          else if (nav.kind === "brand") onViewBrand(nav.value);
          else if (nav.kind === "vehicleType") onViewType(nav.value);
        }}
        onOpenProduct={(p) => onOpenProduct(p.id)}
      />
    );
  }

  return (
    <CollectionsPageListView
      onAddNew={() => handleSetCreating(true)}
      creating={creating}
      onCloseCreating={() => handleSetCreating(false)}
      onCreated={(c) => {
        handleSetCreating(false);
        setNotice(`Đã tạo bộ sưu tập "${c.title}".`);
        if (c.id != null) setSelectedId(`custom-${c.id}`);
      }}
      products={products}
      catalog={catalog}
      notice={notice}
      collectionsError={collectionsError}
      tab={tab}
      onTabChange={handleTabChange}
      counts={counts}
      search={search}
      onSearchChange={handleSearchChange}
      sort={sort}
      onSortChange={handleSortChange}
      loading={loading}
      visibleCount={visible.length}
      paginatedVisible={paginatedVisible}
      selectedId={selectedId}
      selectedRowIds={selectedRowIds}
      confirmDeleteId={confirmDeleteId}
      allDeletableVisibleSelected={allDeletableVisibleSelected}
      deletableVisibleCount={deletableVisible.length}
      onSelectCollection={handleSelectCollection}
      onToggleSelectAll={toggleSelectAllCollections}
      onToggleSelectRow={toggleCollectionSelected}
      onToggleStatus={toggleStatus}
      onConfirmDelete={setConfirmDeleteId}
      onDeleteDirect={deleteCustom}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      selectedCollectionRows={selectedCollectionRows}
      isBulkDeleting={bulkDeleteMut.isPending}
      confirmBulkDelete={confirmBulkDelete}
      setConfirmBulkDelete={setConfirmBulkDelete}
      onConfirmBulkDelete={() =>
        bulkDeleteMut.mutate(
          selectedCollectionRows
            .map((r) => r.custom?.id)
            .filter((x): x is number => x != null),
        )
      }
      onClearBulkSelected={() => setSelectedRowIds(new Set())}
    />
  );
}
