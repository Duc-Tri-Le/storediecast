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

## 🛠️ Đóng gói & Quản lý Bundle Client (`main.js` & `main.css`)

Dự án sử dụng cơ chế build client bằng Bun Bundler + Tailwind CSS v4 cực nhanh (~300ms). Trình duyệt tải giao diện từ thư mục tĩnh `dist/` của từng phân hệ (`admin/client/dist` và `custom/client/dist`).

### 1. Phím tắt nhanh trong IDE (Khuyên dùng)
- Nhấn tổ hợp phím **`Ctrl + Shift + B`** trong VS Code / Antigravity IDE để tự động build lại bundle client ngay tức thì mà không cần mở terminal.

### 2. Chế độ tự động Rebuild khi lưu hoặc hoàn tác file (Watch Mode)
Để không cần gõ lệnh thủ công mỗi lần sửa code hoặc khi hoàn tác (revert/reject) thay đổi:
```bash
# Giám sát và tự rebuild Web Quản Trị (admin):
bun run watch:admin       # hoặc: bun --cwd admin build:watch
```
> **Cơ chế:** Bun sẽ giám sát liên tục thư mục client. Bất cứ khi nào bạn lưu file, AI sinh code, hoặc bạn bấm "Từ chối" (Reject) / Revert Git, bundle `main.js` và Tailwind CSS `main.css` sẽ tự động được biên dịch lại ngay lập tức.

### 3. Lệnh Build thủ công từ Terminal

> [!IMPORTANT]
> **Lưu ý quan trọng khi chạy lệnh:**
> 1. Luôn dùng lệnh có chữ **`run`** (ví dụ: `bun run build`), **không** gõ trơn `bun build` vì Bun sẽ hiểu nhầm là lệnh bundler nội bộ thiếu tham số và báo lỗi `Missing entrypoints`.
> 2. Nếu sửa code giao diện Web Khách (`custom`), cần chạy lệnh build cho `custom` hoặc build tất cả.

```bash
# 🔹 Cách 1: Chạy từ thư mục gốc dự án (d:\code\storediecast)
bun run build              # Build CẢ HAI phân hệ (Admin + Web Khách)
bun run build:custom       # Chỉ build Web Khách (custom/client/dist/main.js & main.css)
bun run build:admin        # Chỉ build Web Quản Trị (admin/client/dist/main.js & main.css)

# 🔹 Cách 2: Chạy trực tiếp trong từng thư mục phân hệ
cd custom && bun run build # Build Web Khách
cd admin && bun run build  # Build Web Quản Trị
```

### 4. Cơ chế chống dính Cache trình duyệt (Hard Refresh)
Cả hai server `admin/server.ts` (cổng 8001) và `custom/server.ts` (cổng 3000) đều được thiết lập header:
```http
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```
Tuy nhiên, trình duyệt web vẫn có thể lưu đệm file `main.js` / `main.css` trong Disk Cache / Memory Cache.
* **Nếu tải lại trang bằng F5 mà chưa thấy thay đổi:**
  * Nhấn tổ hợp phím **`Ctrl + Shift + R`** (hoặc **`Ctrl + F5`**) để buộc trình duyệt xóa cache và nạp file mới nhất từ đĩa.
  * Hoặc mở DevTools (phím **`F12`**) $\to$ thẻ **Network** $\to$ tích chọn ô **"Disable cache"**.

### 5. Xử lý gạch đỏ tạm thời do Cache TypeScript trong IDE (Restart TS Server)
Khi chuyển đổi giữa các file hoặc AI vừa sửa prop của component con (như `onOpenProduct`), TypeScript Language Server trong editor có thể lưu cache định nghĩa cũ và báo lỗi gạch đỏ tạm thời (`Property does not exist on type...`).
- **Khắc phục ngay trong 1 giây:** Nhấn **`Ctrl + Shift + P`** $\to$ Gõ **`TypeScript: Restart TS Server`** $\to$ Nhấn **`Enter`**. Editor sẽ quét lại toàn bộ file trên đĩa và xóa sạch mọi báo lỗi ảo.
- **Kiểm tra thực tế:** Chạy lệnh `cd admin && bun run typecheck` trong terminal để đối soát chính xác theo file thật trên đĩa.

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
