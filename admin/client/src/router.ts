import { useState, useEffect, useCallback } from "react";
import type { Page, OrderTab } from "./types";

export interface AdminRoute {
  page: Page;
  orderId?: number | null;
  orderTab?: OrderTab;
  productId?: number | null;
  collectionId?: string | number | null;
  isNewProduct?: boolean;
  isNewCollection?: boolean;
  isNewBulkUpdate?: boolean;

  // Pagination & Filters
  pageNumber?: number;
  tab?: string;
  search?: string;
  scale?: string | null;
  brand?: string | null;
  vehicleType?: string | null;
  sort?: string;
  filter?: string;
  sortDir?: "asc" | "desc";
}

export function vehicleToCode(v?: string | null): string | null {
  if (!v) return null;
  if (v === "all") return "all";
  if (v === "Ô tô") return "oto";
  if (v === "Xe máy") return "xemay";
  if (v === "Xe bán tải") return "bantai";
  return v;
}

export function codeToVehicle(c?: string | null): string | null {
  if (!c) return null;
  if (c === "all") return "all";
  const lower = c.trim().toLowerCase();
  if (lower === "oto" || lower === "car") return "Ô tô";
  if (lower === "xemay" || lower === "moto") return "Xe máy";
  if (lower === "bantai" || lower === "pickup") return "Xe bán tải";
  return c;
}

export function parseLocation(): AdminRoute {
  if (typeof window === "undefined") return { page: "home" };

  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const searchParams = new URLSearchParams(window.location.search);
  const parsePage = () => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  };

  // 1. Home
  if (pathname === "/" || pathname === "/home") {
    return { page: "home" };
  }

  // 2. Orders
  if (pathname.startsWith("/orders")) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const orderId = Number(parts[1]);
      if (!isNaN(orderId) && orderId > 0) {
        return { page: "orders", orderId };
      }
    }
    const tabParam = (searchParams.get("tab") || "all") as OrderTab;
    const orderTab: OrderTab = ["all", "open", "hold", "closed"].includes(tabParam)
      ? tabParam
      : "all";
    const search = searchParams.get("search") || "";
    const pageNumber = parsePage();
    return { page: "orders", orderId: null, orderTab, tab: orderTab, search, pageNumber };
  }

  // 3. Analytics
  if (pathname === "/analytics") {
    return { page: "analytics" };
  }

  // 4. Products
  if (pathname.startsWith("/products")) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      if (parts[1] === "new") {
        return { page: "products", isNewProduct: true };
      }
      const prodId = Number(parts[1]);
      if (!isNaN(prodId) && prodId > 0) {
        return { page: "products", productId: prodId };
      }
    }
    const pageNumber = parsePage();
    const tab = searchParams.get("tab") || "all";
    const rawScale = searchParams.get("scale");
    const scale = rawScale || "all";
    const rawBrand = searchParams.get("brand");
    const brand = rawBrand || "all";
    const rawVehicle = searchParams.get("vehicleType") || searchParams.get("vehicle");
    const vehicleType = rawVehicle ? (codeToVehicle(rawVehicle) || "all") : "all";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "default";

    return {
      page: "products",
      pageNumber,
      tab,
      scale,
      brand,
      vehicleType,
      search,
      sort,
    };
  }

  // 5. Inventory
  if (pathname === "/inventory") {
    const pageNumber = parsePage();
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "asc";
    return {
      page: "inventory",
      pageNumber,
      filter,
      search,
      sortDir,
    };
  }

  // 6. Collections
  if (pathname.startsWith("/collections")) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      if (parts[1] === "new") {
        return { page: "collections", isNewCollection: true };
      }
      const colId = decodeURIComponent(parts[1] ?? "");
      if (colId) {
        return { page: "collections", collectionId: colId };
      }
    }
    const pageNumber = parsePage();
    const tab = searchParams.get("tab") || "all";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "default";
    return {
      page: "collections",
      pageNumber,
      tab,
      search,
      sort,
    };
  }

  // 7. Bulk Update
  if (pathname.startsWith("/bulk-update") || pathname.startsWith("/bulkUpdate")) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && (parts[1] === "new" || parts[1] === "create")) {
      return { page: "bulkUpdate", isNewBulkUpdate: true };
    }
    return { page: "bulkUpdate" };
  }

  // 8. Discounts
  if (pathname === "/discounts") {
    return { page: "discounts" };
  }

  // 9. Customer Site
  if (pathname === "/customer-site" || pathname === "/customerSite") {
    return { page: "customerSite" };
  }

  // 10. Catalog pages
  if (pathname === "/catalog/vehicle-types" || pathname === "/catalogVehicleTypes") {
    return { page: "catalogVehicleTypes" };
  }
  if (pathname === "/catalog/brands" || pathname === "/catalogCarBrands") {
    return { page: "catalogCarBrands" };
  }
  if (pathname === "/catalog/makers" || pathname === "/catalogModelMakers") {
    return { page: "catalogModelMakers" };
  }
  if (pathname === "/catalog/scales" || pathname === "/catalogScales") {
    return { page: "catalogScales" };
  }

  // Fallback
  return { page: "home" };
}

export function routeToPath(route: AdminRoute): string {
  switch (route.page) {
    case "home":
      return "/";
    case "orders": {
      if (route.orderId) return `/orders/${route.orderId}`;
      const params = new URLSearchParams();
      const pageNumber = route.pageNumber ?? 1;
      const activeTab = route.tab || route.orderTab || "all";
      params.set("page", String(pageNumber));
      params.set("tab", activeTab);
      if (route.search && route.search.trim()) params.set("search", route.search.trim());
      return `/orders?${params.toString()}`;
    }
    case "analytics":
      return "/analytics";
    case "products": {
      if (route.isNewProduct) return "/products/new";
      if (route.productId) return `/products/${route.productId}`;
      const params = new URLSearchParams();
      const pageNumber = route.pageNumber ?? 1;
      const tab = route.tab ?? "all";
      const scale = route.scale ?? "all";
      const brand = route.brand ?? "all";
      const rawVt = route.vehicleType;
      const vehicleType = rawVt ? (vehicleToCode(rawVt) || "all") : "all";
      const sort = route.sort ?? "default";

      params.set("page", String(pageNumber));
      params.set("tab", tab);
      params.set("scale", scale);
      params.set("brand", brand);
      params.set("vehicleType", vehicleType);
      if (route.search && route.search.trim()) params.set("search", route.search.trim());
      params.set("sort", sort);

      return `/products?${params.toString()}`;
    }
    case "inventory": {
      const params = new URLSearchParams();
      const pageNumber = route.pageNumber ?? 1;
      const filter = route.filter ?? "all";
      const sortDir = route.sortDir ?? "asc";

      params.set("page", String(pageNumber));
      params.set("filter", filter);
      if (route.search && route.search.trim()) params.set("search", route.search.trim());
      params.set("sortDir", sortDir);

      return `/inventory?${params.toString()}`;
    }
    case "collections": {
      if (route.isNewCollection) return "/collections/new";
      if (route.collectionId != null && route.collectionId !== "") {
        return `/collections/${encodeURIComponent(route.collectionId)}`;
      }
      const params = new URLSearchParams();
      const pageNumber = route.pageNumber ?? 1;
      const tab = route.tab ?? "all";
      const sort = route.sort ?? "default";

      params.set("page", String(pageNumber));
      params.set("tab", tab);
      if (route.search && route.search.trim()) params.set("search", route.search.trim());
      params.set("sort", sort);

      return `/collections?${params.toString()}`;
    }
    case "bulkUpdate":
      if (route.isNewBulkUpdate) return "/bulk-update/new";
      return "/bulk-update";
    case "discounts":
      return "/discounts";
    case "customerSite":
      return "/customer-site";
    case "catalogVehicleTypes":
      return "/catalog/vehicle-types";
    case "catalogCarBrands":
      return "/catalog/brands";
    case "catalogModelMakers":
      return "/catalog/makers";
    case "catalogScales":
      return "/catalog/scales";
    default:
      return "/";
  }
}

export function useAdminRouter() {
  const [route, setRouteState] = useState<AdminRoute>(parseLocation);

  useEffect(() => {
    const handlePopState = () => {
      setRouteState(parseLocation());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback(
    (newRoute: AdminRoute | Page | string, replace = false) => {
      let targetRoute: AdminRoute;
      let targetPath: string;

      if (typeof newRoute === "string") {
        if (newRoute.startsWith("/")) {
          targetPath = newRoute;
          if (replace) {
            window.history.replaceState(null, "", targetPath);
          } else {
            window.history.pushState(null, "", targetPath);
          }
          targetRoute = parseLocation();
          setRouteState(targetRoute);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        } else {
          targetRoute = { page: newRoute as Page };
          targetPath = routeToPath(targetRoute);
        }
      } else {
        targetRoute = newRoute;
        targetPath = routeToPath(targetRoute);
      }

      if (replace) {
        window.history.replaceState(null, "", targetPath);
      } else {
        window.history.pushState(null, "", targetPath);
      }
      targetRoute = parseLocation();
      setRouteState(targetRoute);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  return { route, navigate, setRouteState };
}
