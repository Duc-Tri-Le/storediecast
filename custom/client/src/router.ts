import { orderCode } from "./utils/format";
import { useState, useEffect, useCallback } from "react";
import type { Page, ScaleFilter, VehicleFilter } from "./types";
import type { PriceRangeKey, SortKey } from "./data/filters";

export interface CustomRoute {
  page: Page;
  productId?: number | null;
  productSlug?: string | null;
  collectionId?: number | null;
  collectionSlug?: string | null;
  orderId?: number | null;
  scale?: ScaleFilter;
  vehicle?: VehicleFilter;
  brand?: string;
  search?: string;
  sort?: SortKey;
  priceRange?: PriceRangeKey;
  pageNumber?: number;
}

export function vehicleToCode(v?: VehicleFilter | null): string | null {
  if (!v) return null;
  if (v === "all") return "all";
  if (v === "Ô tô") return "oto";
  if (v === "Xe máy") return "xemay";
  if (v === "Xe bán tải") return "bantai";
  if (v === "Máy bay") return "maybay";
  return v;
}

export function codeToVehicle(c?: string | null): VehicleFilter {
  if (!c || c === "all") return "all";
  const lower = c.trim().toLowerCase();
  if (lower === "oto" || lower === "car") return "Ô tô";
  if (lower === "xemay" || lower === "moto") return "Xe máy";
  if (lower === "bantai" || lower === "pickup") return "Xe bán tải";
  if (lower === "maybay" || lower === "plane") return "Máy bay";
  return c;
}

export function parsePriceRange(raw?: string | null): PriceRangeKey {
  if (!raw || raw === "all") return "all";
  const val = raw.trim();
  if (["under100", "from100to300", "from300to500", "from500to1m", "over1m"].includes(val)) {
    return val as PriceRangeKey;
  }
  if (val === "0-100" || val === "under-100k" || val === "under-100") return "under100";
  if (val === "100-300" || val === "100to300" || val === "100k-300k") return "from100to300";
  if (val === "300-500" || val === "300to500" || val === "300k-500k") return "from300to500";
  if (val === "500-1m" || val === "500to1m" || val === "500k-1m") return "from500to1m";
  if (val === "over-1m" || val === "over1" || val === "tren1m") return "over1m";
  return "all";
}

export function parseCustomLocation(): CustomRoute {
  if (typeof window === "undefined") return { page: "home" };

  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const searchParams = new URLSearchParams(window.location.search);
  const parsePage = () => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  };

  // 1. Home
  if (pathname === "" || pathname === "/") {
    return { page: "home" };
  }

  // 2. Collection detail (/collections/:id hoặc /collections/:slug)
  if (
    (pathname.startsWith("/collections/") && pathname !== "/collections") ||
    (pathname.startsWith("/collection/") && pathname !== "/collection")
  ) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const colSlugOrId = decodeURIComponent(parts[1] ?? "");
      const numericId = Number(colSlugOrId);
      const pageNumber = parsePage();
      const brand = searchParams.get("brand") || "all";
      const vehicle = codeToVehicle(searchParams.get("vehicle"));
      const scale = (searchParams.get("scale") || "all") as ScaleFilter;
      const sort = (searchParams.get("sort") || "featured") as SortKey;
      const search = searchParams.get("search") || "";
      if (!isNaN(numericId) && numericId > 0 && String(numericId) === colSlugOrId) {
        return {
          page: "collection",
          collectionId: numericId,
          collectionSlug: colSlugOrId,
          pageNumber,
          brand,
          vehicle,
          scale,
          sort,
          search,
        };
      }
      return {
        page: "collection",
        collectionSlug: colSlugOrId,
        pageNumber,
        brand,
        vehicle,
        scale,
        sort,
        search,
      };
    }
  }

  // 3. Collection list (/collections hoặc /collection)
  if (pathname === "/collection" || pathname === "/collections") {
    const pageNumber = parsePage();
    return { page: "collection", pageNumber };
  }

  // 4. Cart
  if (pathname === "/cart") {
    return { page: "cart" };
  }

  // 5. Checkout
  if (pathname === "/checkout") {
    return { page: "checkout" };
  }

  // 6. Orders (/orders/:id hoặc /orders)
  if (pathname.startsWith("/orders") || pathname.startsWith("/order")) {
    const parts = pathname.split("/").filter(Boolean);
    const p1 = parts[1];
    if (p1) {
      const ordId = Number(p1.replace(/\D/g, ""));
      if (!isNaN(ordId) && ordId > 0) {
        return { page: "orders", orderId: ordId };
      }
    }
    return { page: "orders" };
  }

  // 7. FAQ & About
  if (pathname === "/faq") {
    return { page: "faq" };
  }
  if (pathname === "/about") {
    return { page: "about" };
  }

  // 8. Product detail (/product/:id hoặc /products/:id)
  if (
    pathname.startsWith("/product/") ||
    (pathname.startsWith("/products/") && pathname !== "/products")
  ) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const slugOrId = decodeURIComponent(parts[1] ?? "");
      const numericId = Number(slugOrId);
      if (!isNaN(numericId) && numericId > 0 && String(numericId) === slugOrId) {
        return { page: "product", productId: numericId, productSlug: slugOrId };
      }
      return { page: "product", productSlug: slugOrId };
    }
  }

  // 9. Products list
  if (pathname === "/products" || pathname.startsWith("/product")) {
    const rawScale = searchParams.get("scale") || "all";
    const scale: ScaleFilter =
      rawScale === "64" || rawScale === "1-64"
        ? "1:64"
        : rawScale === "32" || rawScale === "1-32"
          ? "1:32"
          : rawScale === "16" || rawScale === "1-16"
            ? "1:16"
            : rawScale;

    const vehicle = codeToVehicle(searchParams.get("vehicle") || searchParams.get("type"));
    const brand = searchParams.get("brand") || "all";
    const search = searchParams.get("q") || "";
    const sort = (searchParams.get("sort") as SortKey) || "featured";
    const priceRange = parsePriceRange(searchParams.get("from") || searchParams.get("price"));
    const pageNumber = parsePage();

    return {
      page: "products",
      scale,
      vehicle,
      brand,
      search,
      sort,
      priceRange,
      pageNumber,
    };
  }

  // Fallback
  return { page: "home" };
}

export function customRouteToPath(route: CustomRoute): string {
  switch (route.page) {
    case "home":
      return "/";
    case "collection": {
      const colId = route.collectionId != null ? String(route.collectionId) : route.collectionSlug;
      if (!colId) {
        const pageNumber = route.pageNumber ?? 1;
        return `/collections?page=${pageNumber}`;
      }
      const params = new URLSearchParams();
      const pageNumber = route.pageNumber ?? 1;
      const brand = route.brand ?? "all";
      const vehicle = route.vehicle ?? "all";
      const scale = route.scale ?? "all";
      const sort = route.sort ?? "featured";

      params.set("page", String(pageNumber));
      params.set("brand", brand);
      if (vehicle !== "all") {
        const vCode = vehicleToCode(vehicle);
        if (vCode) params.set("vehicle", vCode);
      }
      if (scale !== "all") {
        params.set("scale", scale);
      }
      if (route.search && route.search.trim()) params.set("search", route.search.trim());
      params.set("sort", sort);

      return `/collections/${colId}?${params.toString()}`;
    }
    case "cart":
      return "/cart";
    case "checkout":
      return "/checkout";
    case "orders": {
      if (route.orderId) return `/orders/${orderCode(route.orderId)}`;
      return "/orders";
    }
    case "faq":
      return "/faq";
    case "about":
      return "/about";
    case "product": {
      if (route.productId) return `/products/${route.productId}`;
      if (route.productSlug) {
        const num = Number(route.productSlug);
        if (!isNaN(num) && num > 0) return `/products/${num}`;
        return `/products/${route.productSlug}`;
      }
      return "/products";
    }
    case "products": {
      const params = new URLSearchParams();
      const pageNumber = route.pageNumber ?? 1;
      const scale = route.scale ?? "all";
      const vehicle = route.vehicle ?? "all";
      const brand = route.brand ?? "all";
      // Tiền dùng "from" theo đúng yêu cầu: trừ tiền dùng from
      const priceRange = route.priceRange ?? "all";
      const sort = route.sort ?? "featured";

      params.set("page", String(pageNumber));
      params.set("scale", scale);
      const vehicleCode = vehicleToCode(vehicle) || "all";
      params.set("vehicle", vehicleCode);
      params.set("brand", brand);
      params.set("from", priceRange);
      params.set("sort", sort);
      if (route.search && route.search.trim()) params.set("q", route.search.trim());

      const qs = params.toString();
      return qs ? `/products?${qs}` : "/products";
    }
    default:
      return "/";
  }
}

export function useCustomRouter() {
  const [route, setRouteState] = useState<CustomRoute>(parseCustomLocation);

  useEffect(() => {
    const handlePopState = () => {
      setRouteState(parseCustomLocation());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback(
    (newRoute: CustomRoute | Page | string, replace = false) => {
      let targetRoute: CustomRoute;
      let targetPath: string;

      if (typeof newRoute === "string") {
        if (newRoute.startsWith("/")) {
          targetPath = newRoute;
          if (replace) {
            window.history.replaceState(null, "", targetPath);
          } else {
            window.history.pushState(null, "", targetPath);
          }
          targetRoute = parseCustomLocation();
          setRouteState(targetRoute);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        } else {
          targetRoute = { page: newRoute as Page };
          targetPath = customRouteToPath(targetRoute);
        }
      } else {
        targetRoute = newRoute;
        targetPath = customRouteToPath(targetRoute);
      }

      if (replace) {
        window.history.replaceState(null, "", targetPath);
      } else {
        window.history.pushState(null, "", targetPath);
      }
      targetRoute = parseCustomLocation();
      setRouteState(targetRoute);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  return { route, navigate, setRouteState };
}
