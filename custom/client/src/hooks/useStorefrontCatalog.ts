import { useEffect, useMemo } from "react";
import type { CatalogData } from "../types";
import type { Product, ShopCollection } from "../types";
import { customRouteToPath, type CustomRoute } from "../router";
import { anyVariantOnSale } from "../services/pricing";

export function useStorefrontCatalog({
  catalogData,
  allProducts,
  allCollections,
  route,
  page,
  detailProduct,
}: {
  catalogData?: CatalogData | null;
  allProducts: Product[];
  allCollections: ShopCollection[];
  route: CustomRoute;
  page: string;
  detailProduct: Product | null;
}) {
  // Danh sách loại xe động: kết hợp từ bảng catalog_vehicle_types trong CSDL và các sản phẩm thực tế
  const vehicleOptions = useMemo(() => {
    const set = new Set<string>();
    if (catalogData?.vehicleTypes) {
      for (const v of catalogData.vehicleTypes) {
        if (v.name) set.add(v.name.trim());
      }
    }
    for (const p of allProducts) {
      if (p.vehicleType) set.add(p.vehicleType.trim());
    }
    const standard = ["Ô tô", "Xe máy", "Xe bán tải"];
    const extra = Array.from(set).filter((x) => !standard.includes(x)).sort();
    return [...standard.filter((s) => set.has(s)), ...extra];
  }, [catalogData, allProducts]);

  // Danh sách tỉ lệ động: kết hợp từ bảng catalog_scales trong CSDL và các sản phẩm thực tế
  const scaleOptions = useMemo(() => {
    const set = new Set<string>();
    if (catalogData?.scales) {
      for (const s of catalogData.scales) {
        if (s.name) set.add(s.name.trim());
      }
    }
    for (const p of allProducts) {
      if (p.scale) set.add(p.scale.trim());
    }
    const standard = ["1:64", "1:32", "1:16"];
    const extra = Array.from(set).filter((x) => !standard.includes(x)).sort();
    return [...standard.filter((s) => set.has(s)), ...extra];
  }, [catalogData, allProducts]);

  // Danh sách hãng xe động: kết hợp từ bảng catalog_car_brands trong CSDL và các sản phẩm thực tế
  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    if (catalogData?.carBrands) {
      for (const b of catalogData.carBrands) {
        if (b.name) set.add(b.name.trim());
      }
    }
    for (const p of allProducts) {
      if (p.brand) set.add(p.brand.trim());
    }
    return Array.from(set).sort();
  }, [catalogData, allProducts]);

  const featured = useMemo(
    () => allProducts.filter((p) => p.isFeatured),
    [allProducts],
  );

  const newest = useMemo(
    () => [...allProducts].sort((a, b) => b.id - a.id).slice(0, 8),
    [allProducts],
  );

  const onSale = useMemo(() => allProducts.filter((p) => anyVariantOnSale(p)), [allProducts]);

  // Đồng bộ đường dẫn chuẩn bộ sưu tập mang đầy đủ query param khi vào lần đầu
  useEffect(() => {
    if (route.page === "collection") {
      let resolvedColId = route.collectionId;
      if (!resolvedColId && route.collectionSlug && allCollections.length > 0) {
        const found = allCollections.find(
          (c) => String(c.id) === route.collectionSlug || c.slug === route.collectionSlug,
        );
        if (found) resolvedColId = found.id;
      }
      const canonicalRoute: CustomRoute = {
        page: "collection",
        collectionId: resolvedColId ?? route.collectionId,
        collectionSlug: resolvedColId ? String(resolvedColId) : route.collectionSlug,
        pageNumber: route.pageNumber ?? 1,
        brand: route.brand ?? "all",
        sort: route.sort ?? "featured",
        search: route.search,
      };
      const expectedPath = customRouteToPath(canonicalRoute);
      if (typeof window !== "undefined") {
        const currentFull = window.location.pathname + window.location.search;
        if (currentFull !== expectedPath) {
          window.history.replaceState(null, "", expectedPath);
        }
      }
    }
  }, [
    route.page,
    route.collectionId,
    route.collectionSlug,
    route.brand,
    route.sort,
    route.search,
    route.pageNumber,
    allCollections,
  ]);

  // Đồng bộ đường dẫn chuẩn sản phẩm mang đầy đủ query param khi vào lần đầu
  useEffect(() => {
    if (route.page === "products") {
      const expectedPath = customRouteToPath(route);
      if (typeof window !== "undefined") {
        const currentFull = window.location.pathname + window.location.search;
        if (currentFull !== expectedPath) {
          window.history.replaceState(null, "", expectedPath);
        }
      }
    }
  }, [route.page, route.scale, route.vehicle, route.brand, route.priceRange, route.sort, route.pageNumber, route.search]);

  // Đặt Document title
  useEffect(() => {
    if (page === "product" && detailProduct) {
      document.title = `${detailProduct.seoTitle || detailProduct.name} — XE ĐỎ Mô Hình`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        "content",
        detailProduct.seoDescription || detailProduct.description || detailProduct.name,
      );
    } else if (page === "collection") {
      document.title = "Bộ Sưu Tập Xe Mô Hình — XE ĐỎ";
    } else {
      document.title = "Cửa Hàng Xe Mô Hình XE ĐỎ";
    }
  }, [page, detailProduct]);

  return {
    vehicleOptions,
    scaleOptions,
    brandOptions,
    featured,
    newest,
    onSale,
  };
}
