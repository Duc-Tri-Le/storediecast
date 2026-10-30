import type { api, ApiResponse } from "./api";

// Kiểu dữ liệu dùng chung, suy thẳng từ response của server actions —
// server đổi shape thì client báo lỗi type ngay.
export type Product = ApiResponse<typeof api, "listProducts">["products"][number];
export type Order = ApiResponse<typeof api, "listOrders">["orders"][number];
export type Variant = Product["variants"][number];
export type CartLine = { product: Product; variant: Variant | null; qty: number; key: string };
export type ScaleFilter = "all" | "1:64" | "1:32" | "1:16";
export type VehicleFilter = "all" | "Ô tô" | "Xe máy" | "Xe bán tải";
export type Page =
  | "home"
  | "collection"
  | "products"
  | "faq"
  | "about"
  | "orders"
  | "product"
  | "cart"
  | "checkout";

