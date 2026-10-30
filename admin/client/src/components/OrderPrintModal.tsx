import type { Order } from "../types";
import { fmtDate, fmtVND, orderCode, STATUS_LABEL } from "../utils/format";
import { smallBtn } from "./shared";

export function OrderPrintModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#0a2c50]/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`In đơn ${orderCode(order.id)}`}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)] print:m-0 print:max-h-none print:max-w-none print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4 print:border-b-2">
          <div>
            <h2 className="text-xl font-bold">HÓA ĐƠN BÁN HÀNG</h2>
            <p className="font-mono text-sm font-semibold">{orderCode(order.id)}</p>
            <p className="text-xs text-[var(--dim)]">{fmtDate(order.createdAt)}</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">DECAST</p>
            <p className="text-[var(--dim)]">Xe mô hình cao cấp</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 text-xs">
          <div>
            <p className="font-bold">Khách hàng</p>
            <p>{order.customerName}</p>
            <p>{order.customerPhone}</p>
          </div>
          <div>
            <p className="font-bold">Địa chỉ giao hàng</p>
            <p className="break-words">{order.customerAddress}</p>
          </div>
        </div>

        {order.note && (
          <p className="rounded bg-[var(--sidebar)] p-2 text-xs italic">
            Ghi chú: {order.note}
          </p>
        )}

        <table className="mt-3 w-full text-left text-xs">
          <thead>
            <tr className="border-y border-[var(--border)] text-[var(--dim)]">
              <th className="py-2">Sản phẩm</th>
              <th className="py-2 text-center">SL</th>
              <th className="py-2 text-right">Đơn giá</th>
              <th className="py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="py-2">
                  <p className="font-medium">{it.productName}</p>
                  <p className="text-[11px] text-[var(--dim)]">
                    {it.colorName} · Tỉ lệ {it.scale}
                  </p>
                </td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right">{fmtVND(it.unitPrice)}</td>
                <td className="py-2 text-right font-medium">
                  {fmtVND(it.unitPrice * it.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-3 space-y-1 border-t border-[var(--border)] pt-3 text-xs">
          <div className="flex justify-between">
            <dt className="text-[var(--dim)]">Tạm tính</dt>
            <dd>{fmtVND(order.subtotalBeforeBulk)}</dd>
          </div>
          {order.bulkDiscountAmount > 0 && (
            <div className="flex justify-between text-[#14663c]">
              <dt>Giảm theo số lượng ({order.bulkPct}%)</dt>
              <dd>−{fmtVND(order.bulkDiscountAmount)}</dd>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-[#14663c]">
              <dt>Giảm mã {order.discountCode}</dt>
              <dd>−{fmtVND(order.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-[var(--dim)]">Phí vận chuyển</dt>
            <dd>{order.shippingFee === 0 ? "Miễn phí" : fmtVND(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-2 text-sm font-bold">
            <dt>Tổng cộng</dt>
            <dd>{fmtVND(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-dashed border-[var(--border)] pt-3 text-center text-[11px] text-[var(--dim)]">
          <p>
            Phương thức thanh toán:{" "}
            {order.paymentMethod === "cod"
              ? "Thanh toán khi nhận hàng (COD)"
              : "Chuyển khoản"}
          </p>
          <p>Trạng thái: {STATUS_LABEL[order.status] ?? order.status}</p>
          <p className="mt-1">Cảm ơn bạn đã mua hàng tại DECAST!</p>
        </div>

        <div className="mt-6 flex justify-end gap-2 print:hidden">
          <button type="button" onClick={onClose} className={smallBtn}>
            Đóng
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
          >
            In hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
}

