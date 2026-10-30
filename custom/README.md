# XE ĐỎ — Web Bán Hàng Mô Hình Xe (phía khách)

Web bán hàng cho khách của shop mô hình xe XE ĐỎ: xem kệ, lọc, giỏ
hàng, Mua ngay, đặt hàng (chỉ Chuyển khoản), áp mã giảm giá, tra cứu
đơn bằng số điện thoại và tự hủy đơn còn "Mới". Web này KHÔNG có chức
năng quản trị — quản trị sản phẩm / danh mục / mã / đơn nằm ở web quản
trị riêng, dùng CHUNG một database với web này (`data/decast.db`).

## Cài đặt & Chạy độc lập (Bằng Bun hoặc Node.js)

Dự án chạy hoàn toàn độc lập trên máy tính của bạn, không phụ thuộc vào Muse hay cloud platform.

### Chạy bằng Bun (Khuyên dùng - Nhanh nhất):
```bash
cd custom
bun install          # Cài đặt thư viện
bun start            # Khởi động server tại http://localhost:3000
bun run build        # Build lại client bundle khi sửa giao diện
bun test             # Chạy bộ test tính giá & số điện thoại
bun run typecheck    # Kiểm tra kiểu TypeScript
```

### Chạy bằng Node.js / npm:
```bash
cd custom
npm install          # Cài đặt thư viện
npm run dev:node     # Khởi động server tại http://localhost:3000
npm run typecheck    # Kiểm tra kiểu TypeScript
```

## Cấu trúc thư mục

```
client/src/
  App.tsx               # Khung web + các trang (Trang chủ, Sản phẩm, Bộ sưu tập, PDP, Giỏ hàng, Đặt hàng...)
  components/
    ProductCards.tsx    # Thẻ sản phẩm, hàng sản phẩm có mũi tên nổi
    BuyNowDialog.tsx    # Hộp thoại Mua ngay độc lập
    CartPage.tsx        # Trang giỏ hàng riêng
    OrdersView.tsx      # Tra cứu và tự hủy đơn của khách
    CouponField.tsx     # Ô nhập mã giảm giá xác thực qua server
  services/
    pricing.ts          # Công thức tiền phía khách
    cart.ts             # Quản lý giỏ hàng và coupon lưu ở máy khách
  data/maps.ts          # Bản đồ ảnh sản phẩm + logo hãng xe
  address.tsx           # Chọn địa chỉ hành chính Việt Nam + bản đồ OpenStreetMap/Leaflet
  types.ts              # Kiểu dữ liệu suy từ server actions
server/src/
  actions.ts            # 5 server actions bán hàng an toàn
  products.ts           # listProducts — lọc, tìm kiếm, phân trang ở server
  orders.ts             # createOrder, listOrders, updateOrderStatus — trừ/hoàn kho nguyên tử
  discounts.ts          # validateDiscountCode — đọc mã từ database chung
  catalog.ts            # Ánh xạ từ DB sang response (ẩn SKU/hãng mô hình)
  pricing.ts            # Công thức tính tiền phía server (nguồn sự thật)
  phone.ts              # Chuẩn hoá số điện thoại
  schema.ts             # Schema Drizzle trỏ đúng bảng SQLite của admin-web-source
server.ts               # HTTP Server chạy đa nền tảng (hỗ trợ cả Bun và Node.js)
```

## Quy tắc nghiệp vụ đã khóa

- Giá, khuyến mãi, giảm theo tổng số lượng (2 → 7%, 3–4 → 10%, 5+ →
  15%, tính trên tổng rồi trừ một lần), mã giảm giá (tối đa 1 mã/đơn,
  không bắt buộc), freeship từ 1.000.000₫ (xét sau cả hai lần giảm),
  dưới mức phí ship 30.000₫ — tất cả tính lại ở server khi đặt hàng.
- Thanh toán chỉ Chuyển khoản. Web không tự thu tiền.
- Khách chỉ tra cứu và hủy được đơn của chính số điện thoại của mình,
  và chỉ hủy khi đơn còn "Mới"; hủy cộng tồn trả đúng biến thể màu.
- SKU và hãng mô hình là dữ liệu nội bộ của shop: không xuất hiện
  trong bất kỳ response nào phía khách.
