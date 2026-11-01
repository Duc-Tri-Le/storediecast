import { useState, useMemo, useEffect, useRef } from "react";
import type { Product, ShopCollection } from "../types";
import { effectivePrice } from "../services/pricing";

export type CollectionStorefrontSort =
  | "featured"
  | "newest"
  | "priceAsc"
  | "priceDesc"
  | "az"
  | "za";

export const COLLECTION_PAGE_SIZE = 30;

export function useCollectionFilter({
  currentCollection,
  allProducts,
  routeBrand,
  routeVehicle,
  routeScale,
  routeSort,
  routeSearch,
  routePageNumber,
  onNavigateRoute,
}: {
  currentCollection: ShopCollection | null | undefined;
  allProducts: Product[];
  routeBrand?: string;
  routeVehicle?: string;
  routeScale?: string;
  routeSort?: string;
  routeSearch?: string;
  routePageNumber?: number;
  onNavigateRoute?: (params: {
    brand?: string;
    vehicle?: string;
    scale?: string;
    sort?: string;
    search?: string;
    pageNumber?: number;
  }) => void;
}) {
  const [sortKey, setSortKey] = useState<CollectionStorefrontSort>(
    (routeSort as CollectionStorefrontSort) || "featured",
  );
  const [selectedBrand, setSelectedBrand] = useState<string>(routeBrand || "all");
  const [selectedVehicle, setSelectedVehicle] = useState<string>(routeVehicle || "all");
  const [selectedScale, setSelectedScale] = useState<string>(routeScale || "all");
  const [searchQuery, setSearchQuery] = useState<string>(routeSearch || "");
  const [currentPage, setCurrentPage] = useState<number>(routePageNumber || 1);
  const productsTopRef = useRef<HTMLDivElement | null>(null);

  // Đồng bộ state khi URL route thay đổi (back / forward / direct link)
  useEffect(() => {
    if (routeBrand !== undefined) setSelectedBrand(routeBrand || "all");
    if (routeVehicle !== undefined) setSelectedVehicle(routeVehicle || "all");
    if (routeScale !== undefined) setSelectedScale(routeScale || "all");
    if (routeSort !== undefined) setSortKey((routeSort as CollectionStorefrontSort) || "featured");
    if (routeSearch !== undefined) setSearchQuery(routeSearch);
    if (routePageNumber !== undefined && routePageNumber >= 1) {
      setCurrentPage(routePageNumber);
    }
  }, [routeBrand, routeVehicle, routeScale, routeSort, routeSearch, routePageNumber]);

  const handleBrandChange = (b: string) => {
    setSelectedBrand(b);
    setCurrentPage(1);
    onNavigateRoute?.({ brand: b, vehicle: selectedVehicle, scale: selectedScale, sort: sortKey, search: searchQuery, pageNumber: 1 });
  };

  const handleVehicleChange = (v: string) => {
    setSelectedVehicle(v);
    setCurrentPage(1);
    onNavigateRoute?.({ brand: selectedBrand, vehicle: v, scale: selectedScale, sort: sortKey, search: searchQuery, pageNumber: 1 });
  };

  const handleScaleChange = (s: string) => {
    setSelectedScale(s);
    setCurrentPage(1);
    onNavigateRoute?.({ brand: selectedBrand, vehicle: selectedVehicle, scale: s, sort: sortKey, search: searchQuery, pageNumber: 1 });
  };

  const handleSortChange = (st: CollectionStorefrontSort) => {
    setSortKey(st);
    setCurrentPage(1);
    onNavigateRoute?.({ brand: selectedBrand, vehicle: selectedVehicle, scale: selectedScale, sort: st, search: searchQuery, pageNumber: 1 });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    onNavigateRoute?.({ brand: selectedBrand, vehicle: selectedVehicle, scale: selectedScale, sort: sortKey, search: q, pageNumber: 1 });
  };

  const handleResetFilters = () => {
    setSelectedBrand("all");
    setSelectedVehicle("all");
    setSelectedScale("all");
    setSearchQuery("");
    setCurrentPage(1);
    onNavigateRoute?.({ brand: "all", vehicle: "all", scale: "all", sort: sortKey, search: "", pageNumber: 1 });
  };

  // Danh sách sản phẩm thuộc bộ sưu tập đang xem
  const baseCollectionProducts = useMemo(() => {
    if (!currentCollection) return [];
    const scaleMatch = currentCollection.title.match(/1:(64|32|16)/)?.[0];
    return scaleMatch
      ? allProducts.filter((p) => p.scale === scaleMatch)
      : allProducts;
  }, [currentCollection, allProducts]);

  // Các hãng xe có trong bộ sưu tập này để làm bộ lọc nhanh
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    for (const p of baseCollectionProducts) {
      if (p.brand) set.add(p.brand);
    }
    return Array.from(set).sort();
  }, [baseCollectionProducts]);

  // Các loại xe có trong bộ sưu tập (Ô tô, Xe máy, Xe bán tải, Máy bay...)
  const availableVehicles = useMemo(() => {
    const set = new Set<string>();
    for (const p of baseCollectionProducts) {
      if (p.vehicleType) set.add(p.vehicleType);
    }
    return Array.from(set).sort();
  }, [baseCollectionProducts]);

  // Các tỉ lệ có trong bộ sưu tập
  const availableScales = useMemo(() => {
    const set = new Set<string>();
    for (const p of baseCollectionProducts) {
      if (p.scale) set.add(p.scale);
    }
    return Array.from(set).sort();
  }, [baseCollectionProducts]);

  // Lọc và sắp xếp sản phẩm trong bộ sưu tập
  const processedProducts = useMemo(() => {
    let list = [...baseCollectionProducts];

    if (selectedBrand !== "all") {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    if (selectedVehicle !== "all") {
      list = list.filter((p) => p.vehicleType === selectedVehicle);
    }

    if (selectedScale !== "all") {
      list = list.filter((p) => p.scale === selectedScale);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.scale.includes(q) ||
          p.vehicleType.toLowerCase().includes(q),
      );
    }

    switch (sortKey) {
      case "newest":
        list.sort((a, b) => b.id - a.id);
        break;
      case "priceAsc":
        list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case "priceDesc":
        list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        break;
      case "za":
        list.sort((a, b) => b.name.localeCompare(a.name, "vi"));
        break;
      case "featured":
      default:
        list.sort(
          (a, b) =>
            Number(b.isFeatured) - Number(a.isFeatured) ||
            a.name.localeCompare(b.name, "vi"),
        );
        break;
    }

    return list;
  }, [baseCollectionProducts, selectedBrand, selectedVehicle, selectedScale, searchQuery, sortKey]);

  // Phân trang sản phẩm
  const totalPages = Math.max(1, Math.ceil(processedProducts.length / COLLECTION_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * COLLECTION_PAGE_SIZE;
    return processedProducts.slice(start, start + COLLECTION_PAGE_SIZE);
  }, [processedProducts, safePage]);

  // Tự động điều chỉnh về trang cuối nếu filter làm giảm số trang nhỏ hơn currentPage
  useEffect(() => {
    if (processedProducts.length > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
      onNavigateRoute?.({
        brand: selectedBrand,
        vehicle: selectedVehicle,
        scale: selectedScale,
        sort: sortKey,
        search: searchQuery,
        pageNumber: totalPages,
      });
    }
  }, [totalPages, currentPage, processedProducts.length, selectedBrand, selectedVehicle, selectedScale, sortKey, searchQuery, onNavigateRoute]);

  const handlePageChange = (p: number) => {
    const target = Math.min(Math.max(1, p), totalPages);
    setCurrentPage(target);
    onNavigateRoute?.({
      brand: selectedBrand,
      vehicle: selectedVehicle,
      scale: selectedScale,
      sort: sortKey,
      search: searchQuery,
      pageNumber: target,
    });
    if (productsTopRef.current) {
      const offsetTop = productsTopRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
    }
  };

  // Thống kê bộ sưu tập
  const totalStockCount = useMemo(
    () => baseCollectionProducts.reduce((sum, p) => sum + Math.max(0, p.stock), 0),
    [baseCollectionProducts],
  );

  const minPriceInCollection = useMemo(() => {
    const prices = baseCollectionProducts.map(effectivePrice).filter((pr) => pr > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [baseCollectionProducts]);

  return {
    sortKey,
    selectedBrand,
    selectedVehicle,
    selectedScale,
    searchQuery,
    currentPage,
    productsTopRef,
    baseCollectionProducts,
    availableBrands,
    availableVehicles,
    availableScales,
    processedProducts,
    paginatedProducts,
    totalPages,
    safePage,
    totalStockCount,
    minPriceInCollection,
    handleBrandChange,
    handleVehicleChange,
    handleScaleChange,
    handleSortChange,
    handleSearchChange,
    handleResetFilters,
    handlePageChange,
  };
}

