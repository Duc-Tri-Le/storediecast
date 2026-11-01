import { useEffect } from "react";
import type { Product, ScaleFilter, ShopCollection } from "../types";
import {
  useCollectionFilter,
  type CollectionStorefrontSort,
} from "../hooks/useCollectionFilter";
import { CollectionDetailView } from "../components/CollectionDetailView";
import { CollectionsListView } from "../components/CollectionsListView";

export type { CollectionStorefrontSort };

export function CollectionPage({
  allProducts,
  collections = [],
  selectedSlug,
  loading,
  routeBrand,
  routeVehicle,
  routeScale,
  routeSort,
  routeSearch,
  routePageNumber,
  onViewScale,
  onOpenProduct,
  onNavigateCollection,
  onNavigateRoute,
}: {
  allProducts: Product[];
  collections?: ShopCollection[];
  selectedSlug?: string | null;
  loading: boolean;
  routeBrand?: string;
  routeVehicle?: string;
  routeScale?: string;
  routeSort?: string;
  routeSearch?: string;
  routePageNumber?: number;
  onViewScale: (s: ScaleFilter) => void;
  onOpenProduct?: (p: Product) => void;
  onNavigateCollection?: (slugOrPath: string) => void;
  onNavigateRoute?: (params: {
    brand?: string;
    vehicle?: string;
    scale?: string;
    sort?: string;
    search?: string;
    pageNumber?: number;
  }) => void;
}) {
  const currentCollection = selectedSlug
    ? collections.find((c) => c.slug === selectedSlug || String(c.id) === selectedSlug)
    : null;

  // Cập nhật SEO Title & Meta Description theo bộ sưu tập
  useEffect(() => {
    if (currentCollection) {
      document.title = `${currentCollection.seoTitle || currentCollection.title} — XE ĐỎ Mô Hình`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        "content",
        currentCollection.seoDescription || currentCollection.description || currentCollection.title,
      );
    } else {
      document.title = "Bộ Sưu Tập Xe Mô Hình Chính Hãng — XE ĐỎ";
    }
  }, [currentCollection]);

  const filter = useCollectionFilter({
    currentCollection,
    allProducts,
    routeBrand,
    routeVehicle,
    routeScale,
    routeSort,
    routeSearch,
    routePageNumber,
    onNavigateRoute,
  });

  // GIAO DIỆN CHI TIẾT BỘ SƯU TẬP (KHI CÓ selectedSlug)
  if (selectedSlug && currentCollection) {
    return (
      <CollectionDetailView
        currentCollection={currentCollection}
        baseCollectionProducts={filter.baseCollectionProducts}
        availableBrands={filter.availableBrands}
        availableVehicles={filter.availableVehicles}
        availableScales={filter.availableScales}
        processedProducts={filter.processedProducts}
        paginatedProducts={filter.paginatedProducts}
        selectedBrand={filter.selectedBrand}
        selectedVehicle={filter.selectedVehicle}
        selectedScale={filter.selectedScale}
        searchQuery={filter.searchQuery}
        sortKey={filter.sortKey}
        totalPages={filter.totalPages}
        safePage={filter.safePage}
        totalStockCount={filter.totalStockCount}
        minPriceInCollection={filter.minPriceInCollection}
        productsTopRef={filter.productsTopRef}
        onNavigateCollection={onNavigateCollection}
        onBrandChange={filter.handleBrandChange}
        onVehicleChange={filter.handleVehicleChange}
        onScaleChange={filter.handleScaleChange}
        onSortChange={filter.handleSortChange}
        onSearchChange={filter.handleSearchChange}
        onResetFilters={filter.handleResetFilters}
        onPageChange={filter.handlePageChange}
        onOpenProduct={onOpenProduct}
      />
    );
  }

  // GIAO DIỆN DANH SÁCH BỘ SƯU TẬP (/collections)
  return (
    <CollectionsListView
      collections={collections}
      allProducts={allProducts}
      loading={loading}
      onNavigateCollection={onNavigateCollection}
      onViewScale={onViewScale}
    />
  );
}
