import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CatalogData, Order, Product, ShopCollection } from "../types";
import { BulkDeleteBar } from "../components/shared";
import { ProductTable } from "../components/ProductTable";
import { Pagination } from "../components/Pagination";
import {
  ProductFilterBar,
  type ProductSort,
  type ProductTab,
} from "../components/ProductFilterBar";
import { AddProductPage } from "./AddProductPage";
import { ProductDetailPage } from "./ProductDetailPage";
import { useProductsBulkAndCsv } from "../hooks/useProductsBulkAndCsv";
import { ProductsPageHeader } from "../components/ProductsPageHeader";
import {
  PAGE_SIZE,
  useProductsPageFilter,
} from "../hooks/useProductsPageFilter";
import { ProductsPageModals } from "../components/ProductsPageModals";

export type { ProductTab, ProductSort };

export function ProductsPage({
  products: allProductsFallback,
  loading: _fallbackLoading,
  error: _fallbackError,
  collections,
  catalog,
  scaleFilter,
  setScaleFilter,
  extraFilter,
  setExtraFilter,
  openProductId,
  openRequestKey,
  onConsumeOpenRequest,
  routeProductId,
  routeIsNewProduct,
  onNavigateProduct,
  routePageNumber = 1,
  routeTab = "all",
  routeSearch = "",
  routeSort = "default",
  onNavigateRoute,
}: {
  products: Product[];
  orders: Order[];
  openProductId?: number | null;
  openRequestKey?: number;
  onConsumeOpenRequest?: () => void;
  routeProductId?: number | null;
  routeIsNewProduct?: boolean;
  onNavigateProduct?: (target: "new" | number | null) => void;
  loading: boolean;
  error: string | null;
  collections: ShopCollection[];
  catalog: CatalogData | null;
  scaleFilter: string | null;
  setScaleFilter: (s: string | null) => void;
  extraFilter: { kind: "brand" | "vehicleType"; value: string } | null;
  setExtraFilter: (f: { kind: "brand" | "vehicleType"; value: string } | null) => void;
  routePageNumber?: number;
  routeTab?: string;
  routeSearch?: string;
  routeSort?: string;
  onNavigateRoute?: (params: {
    pageNumber?: number;
    tab?: string;
    scale?: string | null;
    brand?: string | null;
    vehicleType?: string | null;
    search?: string;
    sort?: string;
  }) => void;
}) {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);

  const {
    tab,
    search,
    sort,
    currentPage,
    handleTabChange,
    handleSearchChange,
    handleSortChange,
    handlePageChange,
    handleClearScaleFilter,
    handleClearExtraFilter,
    paginatedQuery,
  } = useProductsPageFilter({
    scaleFilter,
    setScaleFilter,
    extraFilter,
    setExtraFilter,
    routePageNumber,
    routeTab,
    routeSearch,
    routeSort,
    onNavigateRoute,
  });

  const {
    selectedIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    bulkDeleteMut,
    importResults,
    setImportResults,
    importOpen,
    setImportOpen,
    importRows,
    setImportRows,
    importFileName,
    setImportFileName,
    importOverwrite,
    setImportOverwrite,
    importPlan,
    importMut,
    doImport,
    closeImport,
    fileRef,
    toggleSelected,
    toggleSelectAllVisible,
  } = useProductsBulkAndCsv({
    allProductsFallback,
    catalog,
    setNotice,
  });

  const paginatedVisible = paginatedQuery.data?.products ?? [];
  const paginatedTotal = paginatedQuery.data?.total ?? 0;
  const paginatedTotalPages = paginatedQuery.data?.totalPages ?? 1;
  const counts = paginatedQuery.data?.counts ?? { all: 0, in: 0, out: 0, bestSelling: 0 };
  const loading = paginatedQuery.isLoading;
  const error = paginatedQuery.error
    ? paginatedQuery.error instanceof Error
      ? paginatedQuery.error.message
      : String(paginatedQuery.error)
    : null;

  const [editing, setEditing] = useState<Product | "new" | null>(() => {
    if (routeIsNewProduct) return "new";
    if (routeProductId != null) {
      return allProductsFallback.find((p) => p.id === routeProductId) ?? null;
    }
    return null;
  });

  const handleEdit = (target: Product | "new" | null) => {
    setEditing(target);
    if (onNavigateProduct) {
      if (target === "new") onNavigateProduct("new");
      else if (target) onNavigateProduct(target.id);
      else onNavigateProduct(null);
    }
  };

  useEffect(() => {
    if (routeIsNewProduct) {
      setEditing("new");
    } else if (routeProductId != null) {
      const target = allProductsFallback.find((p) => p.id === routeProductId);
      if (target) setEditing(target);
    } else if (routeIsNewProduct === false && routeProductId === null) {
      setEditing(null);
    }
  }, [routeIsNewProduct, routeProductId, allProductsFallback]);

  const handledOpenKeyRef = useRef(0);
  useEffect(() => {
    if (openProductId == null || !openRequestKey) return;
    if (handledOpenKeyRef.current === openRequestKey) return;
    const target = allProductsFallback.find((p) => p.id === openProductId);
    if (!target) return;
    handledOpenKeyRef.current = openRequestKey;
    setEditing(target);
    onConsumeOpenRequest?.();
  }, [openProductId, openRequestKey, allProductsFallback, onConsumeOpenRequest]);

  const tabs: Array<[ProductTab, string]> = [
    ["all", "Tất cả"],
    ["in", "Còn hàng"],
    ["out", "Hết hàng"],
    ["bestSelling", "Bán chạy nhất"],
  ];

  const selectedProducts = paginatedVisible.filter((p: Product) => selectedIds.has(p.id));
  const paginatedIds = paginatedVisible.map((p: Product) => p.id);
  const allVisibleSelected =
    paginatedIds.length > 0 && paginatedIds.every((id: number) => selectedIds.has(id));

  const invalidateProductQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-products-paginated"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  if (editing === "new") {
    return (
      <AddProductPage
        allProducts={allProductsFallback}
        catalog={catalog}
        collections={collections}
        onBack={() => handleEdit(null)}
        onSaved={(msg) => {
          handleEdit(null);
          setNotice(msg);
          invalidateProductQueries();
        }}
      />
    );
  }

  if (editing) {
    return (
      <ProductDetailPage
        key={editing.id}
        product={editing}
        allProducts={allProductsFallback}
        collections={collections}
        catalog={catalog}
        onBack={() => handleEdit(null)}
        onSaved={(msg) => {
          handleEdit(null);
          setNotice(msg);
          invalidateProductQueries();
        }}
        onDeleted={(msg) => {
          handleEdit(null);
          setNotice(msg);
          invalidateProductQueries();
        }}
        onDuplicated={(msg) => {
          handleEdit(null);
          setNotice(msg);
          invalidateProductQueries();
        }}
      />
    );
  }

  return (
    <div>
      <ProductsPageHeader
        allProducts={allProductsFallback}
        onAddNew={() => handleEdit("new")}
        onOpenImport={() => {
          setImportResults(null);
          setImportOpen(true);
        }}
        fileRef={fileRef}
        setNotice={setNotice}
        setImportResults={setImportResults}
        setImportFileName={setImportFileName}
        setImportRows={setImportRows}
      />

      <ProductFilterBar
        tab={tab}
        tabs={tabs}
        onTabChange={handleTabChange}
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
        scaleFilter={scaleFilter}
        onClearScaleFilter={handleClearScaleFilter}
        extraFilter={extraFilter}
        onClearExtraFilter={handleClearExtraFilter}
        counts={counts}
      />

      <BulkDeleteBar
        count={selectedProducts.length}
        unit="sản phẩm"
        deleting={bulkDeleteMut.isPending}
        onDelete={() => setConfirmBulkDelete(true)}
        onClear={() => toggleSelectAllVisible(paginatedIds)(false)}
      />

      {loading && <p className="mt-6 text-sm text-[var(--dim)]">Đang tải sản phẩm…</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] p-3 text-sm text-[#9c2b2b]">
          Không tải được sản phẩm: {error}
        </p>
      )}
      {!loading && !error && paginatedVisible.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--dim)]">Không có sản phẩm nào khớp.</p>
      )}

      {paginatedVisible.length > 0 && (
        <>
          <ProductTable
            visible={paginatedVisible}
            selectedIds={selectedIds}
            allVisibleSelected={allVisibleSelected}
            toggleSelectAllVisible={toggleSelectAllVisible(paginatedIds)}
            toggleSelected={toggleSelected}
            onEditProduct={(p) => handleEdit(p)}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={paginatedTotalPages}
            totalItems={paginatedTotal}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <ProductsPageModals
        confirmBulkDelete={confirmBulkDelete}
        selectedProducts={selectedProducts}
        isBulkDeleting={bulkDeleteMut.isPending}
        onConfirmBulkDelete={() => bulkDeleteMut.mutate(Array.from(selectedIds))}
        onCancelBulkDelete={() => setConfirmBulkDelete(false)}
        importOpen={importOpen}
        importFileName={importFileName}
        hasData={Boolean(importRows && importRows.length > 0)}
        importPlan={importPlan}
        importOverwrite={importOverwrite}
        setImportOverwrite={setImportOverwrite}
        fileRef={fileRef}
        onCloseImport={closeImport}
        onImport={doImport}
        isImporting={importMut.isPending}
        importResults={importResults}
        onCloseImportResults={() => setImportResults(null)}
        notice={notice}
        onCloseNotice={() => setNotice(null)}
      />
    </div>
  );
}
