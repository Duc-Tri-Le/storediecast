import { orderCode } from "../utils/format";
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

export function CheckoutSuccessCard({
  placed,
  onShop,
}: {
  placed: PlacedOrderInfo;
  onShop: () => void;
}) {
  return (
    <div className="mt-8 max-w-xl">
      <div className="rounded-2xl bg-[var(--surface)] p-6 text-center border border-[var(--border)]">
        <p className="text-4xl" aria-hidden>✓</p>
        <h2 className="mt-2 text-lg font-black">Đặt hàng thành công</h2>
        <p className="mt-1 font-bold">Đơn {orderCode(placed.id)} đã được ghi nhận</p>
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
          Xem lại đơn hàng tại{" "}
          <a
            href={`/orders/${orderCode(placed.id)}`}
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState(null, "", `/orders/${orderCode(placed.id)}`);
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="font-bold text-[var(--accent)] underline underline-offset-2 cursor-pointer"
          >
            Đơn hàng {orderCode(placed.id)}
          </a>
          {" "}hoặc tra cứu bằng số điện thoại vừa đặt ở mục “Tra cứu đơn hàng”.
        </p>
      </div>
      <button
        type="button"
        onClick={onShop}
        className="mt-4 w-full rounded-full bg-[var(--accent)] py-3.5 font-bold text-white cursor-pointer"
      >
        Tiếp tục xem mô hình
      </button>
    </div>
  );
}

