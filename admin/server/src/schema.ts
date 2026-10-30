// Web quản trị này không có bảng dữ liệu riêng.
//
// Toàn bộ dữ liệu shop (sản phẩm, biến thể màu, đơn hàng, mã giảm giá)
// nằm trong app.db của web bán hàng web-b-n-h-ng-cho-kh-ch — đúng một
// database chung cho hai web — và được đọc/ghi qua handler đặc quyền
// trong server/src/privileged.ts. Bảng `entries` mẫu của scaffold đã
// bị gỡ bằng migration đi kèm; file này cố ý không khai báo bảng nào
// để không ai vô tình tạo ra một bản sao dữ liệu thứ hai ở đây.

export {};
