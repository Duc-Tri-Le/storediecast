import { fmt } from "../services/pricing";

export type PlacedOrderInfo = {
  id: number;
  total: number;
  subtotalBefore: number;
  bulkPct: number;
  bulkDiscount: number;
  subtotalAfterBulk: number;
  code: string | null;
  discount: number;
  subtotalAfterCoupon: number;
  shippingFee: number;
};

export function BuyNowPlacedView({
  placed,
  cleanName,
  colorName,
  qty,
  onClose,
}: {
  placed: PlacedOrderInfo;
  cleanName: string;
  colorName: string;
  qty: number;
  onClose: () => void;
}) {
  return (
    <div className="px-5 py-6">
      <div className="rounded-2xl bg-[var(--surface2)] p-5 text-center">
        <p className="text-4xl" aria-hidden>✓</p>
        <p className="mt-2 font-bold">Đơn #{placed.id} đã được ghi nhận</p>
        <p className="mt-1 text-sm text-[var(--dim)]">
          {cleanName} · Màu {colorName} × {qty}
        </p>
        <p className="mt-1 text-sm text-[var(--dim)]">
          Tạm tính: {fmt(placed.subtotalBefore)}
          {placed.bulkPct > 0
            ? ` — giảm theo số lượng ${placed.bulkPct}%: −${fmt(placed.bulkDiscount)}, tạm tính sau giảm theo số lượng ${fmt(placed.subtotalAfterBulk)}`
            : ""}
          {placed.code
            ? ` — giảm giá mã ${placed.code}: −${fmt(placed.discount)}, tạm tính sau mã ${fmt(placed.subtotalAfterCoupon)}`
            : ""}
          {`, phí ship ${placed.shippingFee === 0 ? "Miễn phí" : fmt(placed.shippingFee)}.`}
        </p>
        <p className="mt-1 text-sm text-[var(--dim)]">
          Tổng thanh toán:{" "}
          <span className="font-bold text-[var(--text)]">{fmt(placed.total)}</span>
          {" — thanh toán bằng chuyển khoản."}
        </p>
        <p className="mt-2 text-sm text-[var(--dim)]">
          Tra cứu đơn bằng đúng số điện thoại vừa đặt ở mục “Tra cứu đơn hàng”.
          Giỏ hàng của bạn vẫn giữ nguyên, không thay đổi.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-full bg-[var(--accent)] py-3.5 font-bold text-white"
      >
        Tiếp tục xem mô hình
      </button>
    </div>
  );
}

