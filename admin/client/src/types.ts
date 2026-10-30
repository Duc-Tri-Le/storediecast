import { api, type ApiRequest, type ApiResponse } from "./api";

export type Overview = ApiResponse<typeof api, "adminOverview">;
export type Product = ApiResponse<typeof api, "adminListProducts">["products"][number];
export type Variant = Product["variants"][number];
export type Order = ApiResponse<typeof api, "adminListOrders">["orders"][number];
export type OrderTab = "all" | "open" | "hold" | "closed";
export type Discount = ApiResponse<typeof api, "adminListDiscounts">["discounts"][number];
export type Analytics = ApiResponse<typeof api, "adminAnalytics">;
export type AnalyticsRange = ApiRequest<typeof api, "adminAnalytics">["range"];
export type AnalyticsProduct = Analytics["topByQty"][number];
export type AnalyticsGroup = Analytics["byScale"][number];
export type AnalyticsUnpaidOrder = Analytics["unpaidOrders"]["orders"][number];
export type ShopCollection = ApiResponse<typeof api, "adminListCollections">["collections"][number];
export type ProductInput = ApiRequest<typeof api, "adminUpsertProduct">;
export type CatalogData = ApiResponse<typeof api, "adminListCatalog">;
export type CatalogKind = "vehicleTypes" | "carBrands" | "modelMakers" | "scales";
export type CatalogEntry = CatalogData["carBrands"][number];

export type Page =
  | "home"
  | "orders"
  | "analytics"
  | "products"
  | "inventory"
  | "collections"
  | "bulkUpdate"
  | "discounts"
  | "customerSite"
  | "catalogVehicleTypes"
  | "catalogCarBrands"
  | "catalogModelMakers"
  | "catalogScales";

export const PRODUCT_CHILD_PAGES: Page[] = ["products", "inventory", "collections", "bulkUpdate"];

export const CATALOG_CHILD_PAGES: Page[] = [
  "catalogVehicleTypes",
  "catalogCarBrands",
  "catalogModelMakers",
  "catalogScales",
];

export const CATALOG_PAGE_KIND: Record<string, CatalogKind> = {
  catalogVehicleTypes: "vehicleTypes",
  catalogCarBrands: "carBrands",
  catalogModelMakers: "modelMakers",
  catalogScales: "scales",
};
