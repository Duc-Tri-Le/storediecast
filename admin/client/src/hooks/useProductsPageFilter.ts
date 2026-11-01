import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { ProductSort, ProductTab } from "../components/ProductFilterBar";

export const PAGE_SIZE = 50;

export interface UseProductsPageFilterOptions {
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
}

export function useProductsPageFilter({
  scaleFilter,
  setScaleFilter,
  extraFilter,
  setExtraFilter,
  routePageNumber = 1,
  routeTab = "all",
  routeSearch = "",
  routeSort = "default",
  onNavigateRoute,
}: UseProductsPageFilterOptions) {
  const [tab, setTabLocal] = useState<ProductTab>(
    routeTab && ["all", "in", "out", "bestSelling"].includes(routeTab)
      ? (routeTab as ProductTab)
      : "all",
  );
  const [search, setSearchLocal] = useState(routeSearch || "");
  const [sort, setSortLocal] = useState<ProductSort>(
    routeSort &&
      [
        "default",
        "bestSelling",
        "bestRevenue",
        "salesAsc",
        "nameAsc",
        "nameDesc",
        "priceAsc",
        "priceDesc",
      ].includes(routeSort)
      ? (routeSort as ProductSort)
      : "default",
  );
  const [currentPage, setCurrentPageLocal] = useState(routePageNumber || 1);

  // Sync state when URL route changes
  useEffect(() => {
    if (routePageNumber != null) setCurrentPageLocal(routePageNumber);
    if (routeTab != null && ["all", "in", "out", "bestSelling"].includes(routeTab)) {
      setTabLocal(routeTab as ProductTab);
    }
    if (routeSearch !== undefined) setSearchLocal(routeSearch);
    if (routeSort != null) {
      setSortLocal(
        [
          "default",
          "bestSelling",
          "bestRevenue",
          "salesAsc",
          "nameAsc",
          "nameDesc",
          "priceAsc",
          "priceDesc",
        ].includes(routeSort)
          ? (routeSort as ProductSort)
          : "default",
      );
    }
  }, [routePageNumber, routeTab, routeSearch, routeSort]);

  const brandVal = extraFilter?.kind === "brand" ? extraFilter.value : null;
  const vehicleTypeVal = extraFilter?.kind === "vehicleType" ? extraFilter.value : null;

  const updateRoute = (updates: {
    pageNumber?: number;
    tab?: ProductTab;
    scale?: string | null;
    extra?: { kind: "brand" | "vehicleType"; value: string } | null;
    search?: string;
    sort?: ProductSort;
  }) => {
    const nextTab = updates.tab !== undefined ? updates.tab : tab;
    const nextSearch = updates.search !== undefined ? updates.search : search;
    const nextSort = updates.sort !== undefined ? updates.sort : sort;
    const nextScale = updates.scale !== undefined ? updates.scale : (scaleFilter || "all");
    const nextBrand =
      updates.extra !== undefined
        ? updates.extra?.kind === "brand"
          ? updates.extra.value
          : "all"
        : (brandVal || "all");
    const nextVehicleType =
      updates.extra !== undefined
        ? updates.extra?.kind === "vehicleType"
          ? updates.extra.value
          : "all"
        : (vehicleTypeVal || "all");
    const nextPage = updates.pageNumber !== undefined ? updates.pageNumber : currentPage;

    if (onNavigateRoute) {
      onNavigateRoute({
        pageNumber: nextPage,
        tab: nextTab,
        scale: nextScale,
        brand: nextBrand,
        vehicleType: nextVehicleType,
        search: nextSearch,
        sort: nextSort,
      });
    }
  };

  const handleTabChange = (t: ProductTab) => {
    setTabLocal(t);
    setCurrentPageLocal(1);
    updateRoute({ tab: t, pageNumber: 1 });
  };

  const handleSearchChange = (s: string) => {
    setSearchLocal(s);
    setCurrentPageLocal(1);
    updateRoute({ search: s, pageNumber: 1 });
  };

  const handleSortChange = (st: ProductSort) => {
    setSortLocal(st);
    setCurrentPageLocal(1);
    updateRoute({ sort: st, pageNumber: 1 });
  };

  const handlePageChange = (p: number) => {
    setCurrentPageLocal(p);
    updateRoute({ pageNumber: p });
  };

  const handleClearScaleFilter = () => {
    setScaleFilter(null);
    setCurrentPageLocal(1);
    updateRoute({ scale: "all", pageNumber: 1 });
  };

  const handleClearExtraFilter = () => {
    setExtraFilter(null);
    setCurrentPageLocal(1);
    updateRoute({ extra: null, pageNumber: 1 });
  };

  const paginatedQuery = useQuery({
    queryKey: [
      "admin-products-paginated",
      currentPage,
      PAGE_SIZE,
      tab,
      search,
      sort,
      scaleFilter,
      extraFilter,
    ],
    queryFn: async () => {
      const res = await api.adminListProductsPaginated({
        page: currentPage,
        pageSize: PAGE_SIZE,
        tab,
        search: search.trim(),
        sort,
        scale: scaleFilter && scaleFilter !== "all" ? scaleFilter : null,
        brand: extraFilter?.kind === "brand" ? extraFilter.value : null,
        vehicleType: extraFilter?.kind === "vehicleType" ? extraFilter.value : null,
      });
      return res;
    },
    staleTime: 5000,
  });

  return {
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
  };
}
