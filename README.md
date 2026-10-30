# Hệ Thống Bán & Quản Trị Xe Mô Hình — XE ĐỎ

Dự án gồm 2 phân hệ chạy độc lập nhưng **dùng CHUNG 100% cơ sở dữ liệu SQLite đặt tại thư mục riêng `data/decast.db`**.

---

## 🏗️ Cấu trúc hệ thống chuẩn

```
decast/
├── data/                        # 🗄️ THƯ MỤC CƠ SỞ DỮ LIỆU CHUNG (Độc lập hoàn toàn)
│   └── decast.db                # File SQLite dùng chung duy nhất cho cả 2 phân hệ
│
├── admin/                       # [PHÂN HỆ 1] Web Quản Trị Shop (React 19 + TypeScript)
│   ├── client/                  # Giao diện quản trị (Trắng - Xanh dương)
│   ├── server/                  # Server Actions quản trị (Drizzle ORM)
│   ├── server.ts                # HTTP Server cổng 8001 (Bun hoặc Node.js)
│   ├── run-admin.bat            # Script chạy nhanh Web Quản Trị (Windows bat)
│   └── run-admin.ps1            # Script chạy nhanh Web Quản Trị (PowerShell)
│
├── custom/                      # [PHÂN HỆ 2] Web Bán Hàng Cho Khách (React 19 + TypeScript)
│   ├── client/                  # Giao diện khách (Red + Beige, responsive, Leaflet OSM)
│   ├── server/                  # 5 Server Actions bán hàng an toàn (Drizzle ORM)
│   ├── server.ts                # HTTP Server cổng 3000 (Bun hoặc Node.js)
│   ├── run-custom.bat           # Script chạy nhanh Web Bán Hàng (Windows bat)
│   └── run-custom.ps1           # Script chạy nhanh Web Bán Hàng (PowerShell)
│
├── run-all.bat                  # 🚀 Click đúp để khởi động cả 2 server trên Windows
└── run-all.ps1                  # 🚀 Script PowerShell khởi động cả 2 server
```

---

## 📦 Yêu cầu môi trường & Cài đặt các gói cần thiết

### 1. Yêu cầu môi trường
- **Bun** (khuyên dùng - nhanh nhất) HOẶC **Node.js** phiên bản 18+ kèm `npm`.

---

### 2. Câu lệnh cài đặt các gói

#### A. Web Quản Trị (`admin`)
```bash
cd admin
bun install   # hoặc npm install
```

#### B. Web Bán Hàng (`custom`)
```bash
cd custom
bun install   # hoặc npm install
```

---

## ⚡ Khởi động nhanh (Chạy cả 2 web dùng chung DB)

### Cách 1: Click đúp file `run-all.bat` trên Windows Explorer
*(Tự động phát hiện môi trường Bun hoặc Node.js, tự cài `node_modules` nếu chưa có và truyền đường dẫn CSDL chuẩn `data/decast.db`)*

### Cách 2: Chạy bằng dòng lệnh PowerShell:
```powershell
.\run-all.ps1
```

### Cách 3: Chạy từng server thủ công trong 2 cửa sổ terminal:

1. **Terminal 1 — Web Quản Trị (Cổng 8001):**
   ```bash
   cd admin
   bun start    # hoặc npm run start:node
   ```
   👉 Mở trình duyệt vào: **http://localhost:8001/**

2. **Terminal 2 — Web Bán Hàng (Cổng 3000):**
   ```bash
   cd custom
   bun start    # hoặc npm run start:node
   ```
   👉 Mở trình duyệt vào: **http://localhost:3000/**

---

## 🔄 Cơ chế đồng bộ dữ liệu thời gian thực

Cả 2 server đều kết nối trực tiếp vào file SQLite độc lập tại: `data/decast.db` với chế độ `PRAGMA journal_mode = WAL` và `PRAGMA foreign_keys = ON`:

1. **Thêm / Sửa / Xóa Sản phẩm:**
   - Chủ shop vào Quản trị (`http://localhost:8001/`) thêm xe mới, chỉnh sửa giá bán, cập nhật tồn kho hoặc tải ảnh lên.
   - Web khách (`http://localhost:3000/`) tải lại hoặc chuyển trang là thấy ngay sản phẩm và giá mới.

2. **Khách đặt hàng:**
   - Khách chọn xe, chọn màu, mua nhiều giảm nhiều hoặc áp mã giảm giá (`GIAM10`, `GIAM50K`) rồi đặt hàng trên Web Khách.
   - Tồn kho biến thể màu tương ứng bị trừ nguyên tử ngay trong `data/decast.db`.
   - Trang Quản trị đơn hàng của chủ shop lập tức hiển thị đơn mới với mã `DCDTxxxx`.

3. **Khách hủy đơn hoặc Shop hủy đơn:**
   - Khách tra cứu bằng số điện thoại và tự hủy đơn khi trạng thái còn "Mới" (`new`).
   - Tồn kho tự động hoàn trả đúng số lượng về biến thể màu tương ứng trong `data/decast.db`.
   - Trạng thái đơn đổi thành `cancelled` cho cả hai bên thấy.

4. **Mã giảm giá:**
   - Tạo/bật/tắt mã trong Quản trị $\to$ Khách nhập mã tại Giỏ hàng hoặc Mua ngay sẽ được áp dụng ngay lập tức.
