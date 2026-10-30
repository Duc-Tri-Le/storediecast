export function ContactDialog({
  onClose,
  onOpenFaq,
  onOpenOrders,
}: {
  onClose: () => void;
  onOpenFaq: () => void;
  onOpenOrders: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Liên hệ với XE ĐỎ Model Shop"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[var(--surface)] md:rounded-3xl">
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <h2 className="text-xl font-black tracking-tight">Liên hệ với shop</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thông tin liên hệ"
            className="flex min-h-[44px] shrink-0 items-center rounded-full bg-[var(--dark)] px-4 py-2 text-sm font-bold text-white"
          >
            Đóng ✕
          </button>
        </div>
        <div className="px-5 pb-6 pt-3">
          <p className="rounded-xl bg-[var(--surface2)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--dim)]">
            Thông tin liên hệ bên dưới đang là <strong className="text-[var(--text)]">thông tin mẫu</strong> —
            shop cần thay bằng email, địa chỉ và số điện thoại thật trước khi bán thật.
          </p>
          <address className="mt-4 space-y-2.5 text-[15px] leading-relaxed not-italic">
            <p>
              <strong>Email:</strong> <span className="text-[var(--dim)]">hotro@xedo.vn (mẫu — cần thay)</span>
            </p>
            <p>
              <strong>Hotline / Zalo:</strong> <span className="text-[var(--dim)]">0900 000 000 (mẫu — cần thay)</span>
            </p>
            <p>
              <strong>Địa chỉ:</strong>{" "}
              <span className="text-[var(--dim)]">Việt Nam (địa chỉ mẫu — cần thay bằng địa chỉ thật của shop)</span>
            </p>
            <p>
              <strong>Ngày làm việc:</strong>{" "}
              <span className="text-[var(--dim)]">Thứ 2 – Thứ 7 | 8:30 – 20:30 (giờ Việt Nam)</span>
            </p>
          </address>
          <p className="mt-4 text-sm leading-relaxed text-[var(--dim)]">
            Cách nhanh nhất khi cần hỗ trợ một đơn đã đặt: chuẩn bị sẵn số điện thoại đã dùng
            khi đặt hàng, shop sẽ đối chiếu với đơn của bạn. Bạn cũng có thể tự tra cứu hoặc
            hủy đơn còn ở trạng thái “Mới” ngay trên web.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenOrders}
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Tra cứu đơn hàng của tôi
            </button>
            <button
              type="button"
              onClick={onOpenFaq}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold"
            >
              Đọc hỏi đáp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

