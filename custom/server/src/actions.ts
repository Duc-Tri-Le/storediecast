import type { ActionsModule } from "./space";
import { listProducts } from "./products";
import { createOrder, listOrders, updateOrderStatus } from "./orders";
import { validateDiscountCode } from "./discounts";

// ── Bề mặt action của WEB BÁN HÀNG CHO KHÁCH — chỉ 5 action bán hàng ──
// Logic nằm ở các module riêng: products.ts (danh sách + lọc + phân
// trang ở server), orders.ts (tạo / tra cứu / hủy đơn, tồn kho nguyên
// tử), discounts.ts (mã giảm giá đọc từ database chung), catalog.ts
// (ánh xạ response, không lộ SKU/hãng mô hình nội bộ), pricing.ts
// (công thức tiền), phone.ts (chuẩn hoá số điện thoại), sku.ts (mã
// SKU nội bộ — chỉ dùng trong database, không có action nào trả ra).
//
// ĐÃ GỠ khỏi bề mặt khách (rà soát 30/10/2026, điểm 1): ba action nạp /
// sửa kệ seedSampleCatalog, applyColorVariants, applyProductImages —
// chúng nhận request rỗng từ khách ẩn danh và ghi/sửa database chung.
// Dữ liệu mẫu của chúng nằm ở seed.ts (không được import ở đây) và chỉ
// builder mới dùng trong tác vụ nội bộ riêng khi chủ shop yêu cầu.
// Mọi chức năng quản trị (thêm/sửa/xóa sản phẩm, danh mục, mã, xử lý
// đơn của shop) nằm ở WEB QUẢN TRỊ RIÊNG, không nằm trong file này.

export const Actions = {
  listProducts,
  createOrder,
  listOrders,
  updateOrderStatus,
  validateDiscountCode,
} satisfies ActionsModule;
