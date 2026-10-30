import { Icon, ICONS } from "../components/shared";

export function CustomerSitePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Xem web khách</h1>
      <div className="mt-5 max-w-xl rounded-2xl border border-[var(--border)] p-5">
        <p className="flex items-center gap-2 font-semibold">
          <Icon d={ICONS.store} /> Web Bán Hàng Cho Khách
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--dim)]">
          Web bán hàng là một web riêng, mở từ danh sách web của bạn. Hai web dùng chung đúng
          một database, nên mọi thay đổi bạn vừa lưu ở đây — sản phẩm, giá, khuyến mãi, tồn kho
          theo màu, bộ sưu tập, mã giảm giá — đã nằm sẵn trong dữ liệu web khách đang đọc; mở
          web khách lên là thấy ngay, không cần đồng bộ thêm bước nào.
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--dim)]">
          Lưu ý: web quản trị này không có mật khẩu — đừng chia sẻ đường dẫn của nó cho người
          ngoài.
        </p>
      </div>
    </div>
  );
}

