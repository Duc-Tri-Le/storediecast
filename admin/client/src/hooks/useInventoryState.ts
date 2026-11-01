import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Product, ProductInput, Variant } from "../types";
import { productInputWithStocks } from "../components/InventoryTable";

export type StockFilter = "all" | "in" | "low" | "out";
export const PAGE_SIZE = 50;

export interface UseInventoryStateOptions {
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
}

export function useInventoryState({
  routePageNumber = 1,
  routeFilter = "all",
  routeSearch = "",
  routeSortDir = "asc",
  onNavigateRoute,
}: UseInventoryStateOptions) {
  const queryClient = useQueryClient();

  const [search, setSearchLocal] = useState(routeSearch || "");
  const [filter, setFilterLocal] = useState<StockFilter>(
    routeFilter && ["all", "in", "low", "out"].includes(routeFilter)
      ? (routeFilter as StockFilter)
      : "all",
  );
  const [sortDir, setSortDirLocal] = useState<"asc" | "desc">(
    routeSortDir === "desc" ? "desc" : "asc",
  );
  const [currentPage, setCurrentPageLocal] = useState(routePageNumber || 1);

  useEffect(() => {
    if (routePageNumber != null) setCurrentPageLocal(routePageNumber);
    if (routeFilter != null && ["all", "in", "low", "out"].includes(routeFilter)) {
      setFilterLocal(routeFilter as StockFilter);
    }
    if (routeSearch !== undefined) setSearchLocal(routeSearch);
    if (routeSortDir != null) setSortDirLocal(routeSortDir);
  }, [routePageNumber, routeFilter, routeSearch, routeSortDir]);

  const updateRoute = (updates: {
    pageNumber?: number;
    filter?: StockFilter;
    search?: string;
    sortDir?: "asc" | "desc";
  }) => {
    const nextFilter = updates.filter !== undefined ? updates.filter : filter;
    const nextSearch = updates.search !== undefined ? updates.search : search;
    const nextSortDir = updates.sortDir !== undefined ? updates.sortDir : sortDir;
    const nextPage = updates.pageNumber !== undefined ? updates.pageNumber : currentPage;

    if (onNavigateRoute) {
      onNavigateRoute({
        pageNumber: nextPage,
        filter: nextFilter,
        search: nextSearch,
        sortDir: nextSortDir,
      });
    }
  };

  const handleFilterChange = (f: StockFilter) => {
    setFilterLocal(f);
    setCurrentPageLocal(1);
    updateRoute({ filter: f, pageNumber: 1 });
  };

  const handleSearchChange = (s: string) => {
    setSearchLocal(s);
    setCurrentPageLocal(1);
    updateRoute({ search: s, pageNumber: 1 });
  };

  const handleSortDirChange = (updater: ((d: "asc" | "desc") => "asc" | "desc") | ("asc" | "desc")) => {
    const next = typeof updater === "function" ? updater(sortDir) : updater;
    setSortDirLocal(next);
    updateRoute({ sortDir: next });
  };

  const handlePageChange = (p: number) => {
    setCurrentPageLocal(p);
    updateRoute({ pageNumber: p });
  };

  const invQ = useQuery({
    queryKey: ["admin-inventory-paginated", currentPage, PAGE_SIZE, filter, search, sortDir],
    queryFn: async () => {
      const res = await api.adminListInventoryPaginated({
        page: currentPage,
        pageSize: PAGE_SIZE,
        filter,
        search: search.trim(),
        sortDir,
      });
      return res;
    },
    staleTime: 5000,
  });

  const paginatedRows = invQ.data?.rows ?? [];
  const total = invQ.data?.total ?? 0;
  const totalPages = invQ.data?.totalPages ?? 1;
  const counts = invQ.data?.counts ?? { all: 0, in: 0, low: 0, out: 0 };
  const loading = invQ.isLoading;
  const error = invQ.error ? (invQ.error instanceof Error ? invQ.error.message : String(invQ.error)) : null;

  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (args: { input: ProductInput; variantIds: number[]; label: string }) =>
      api.adminUpsertProduct(args.input),
    onSuccess: (res, vars) => {
      if (res.ok) {
        setDrafts((prev) => {
          const next = { ...prev };
          for (const vid of vars.variantIds) delete next[vid];
          return next;
        });
        setNotice(`Đã cập nhật số lượng tồn cho ${vars.label}.`);
        void queryClient.invalidateQueries({ queryKey: ["admin-inventory-paginated"] });
        void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      } else {
        setNotice(res.error ?? "Không lưu được số lượng tồn.");
      }
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : String(e)),
  });

  const deleteVariantsMut = useMutation({
    mutationFn: (variantIds: number[]) => api.adminDeleteVariants({ variantIds }),
    onSuccess: (res) => {
      setConfirmBulkDelete(false);
      if (res.ok) {
        setSelected([]);
        const pExtra =
          res.deletedProducts > 0
            ? ` (${res.deletedProducts} sản phẩm không còn màu nào đã được xóa tự động)`
            : "";
        setNotice(
          `Đã xóa vĩnh viễn ${res.deleted} biến thể màu khỏi database chung${pExtra}.`,
        );
        void queryClient.invalidateQueries({ queryKey: ["admin-inventory-paginated"] });
        void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      } else {
        setNotice(res.error ?? "Không xóa được các biến thể màu đã chọn.");
      }
    },
    onError: (e) => {
      setConfirmBulkDelete(false);
      setNotice(e instanceof Error ? e.message : String(e));
    },
  });

  const selectedRows = paginatedRows.filter((r) => selected.includes(r.variant.id));

  const parsedDraft = (variantId: number): number | null => {
    const raw = drafts[variantId];
    if (raw === undefined) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isInteger(n) ? n : null;
  };

  const targetFor = (variant: Variant): number | null => parsedDraft(variant.id) ?? variant.stock;

  const stepDraft = (variant: Variant, delta: number) => {
    const cur = targetFor(variant) ?? variant.stock;
    const next = Math.max(0, cur + delta);
    setDrafts((d) => ({ ...d, [variant.id]: String(next) }));
  };

  const saveRow = (product: Product, variant: Variant) => {
    const target = targetFor(variant);
    if (target == null || target === variant.stock) return;
    saveMut.mutate({
      input: productInputWithStocks(product, new Map([[variant.id, target]])),
      variantIds: [variant.id],
      label: `${product.name} — màu ${variant.colorName} (${variant.stock} → ${target})`,
    });
  };

  const visibleIds = paginatedRows.map((r) => r.variant.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggleSelect = (variantId: number, checked: boolean) =>
    setSelected((prev) => (checked ? [...prev, variantId] : prev.filter((id) => id !== variantId)));

  return {
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
    setNotice,
    saveMut,
    deleteVariantsMut,
    selectedRows,
    parsedDraft,
    targetFor,
    stepDraft,
    saveRow,
    visibleIds,
    allVisibleSelected,
    toggleSelect,
  };
}

