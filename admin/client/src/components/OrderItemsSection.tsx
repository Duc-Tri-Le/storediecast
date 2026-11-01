import type { Order, Product } from "../types";
import { fmtVND } from "../utils/format";
import { cardCls, smallBtn } from "./shared";
import { OrderItemThumb } from "./OrderComponents";

export function OrderItemsSection({
  order,
  products,
  deliveryLabel,
  totalQty,
  confirmCancel,
  setConfirmCancel,
  isStatusPending,
  onConfirmOrder,
  onMarkDone,
  onCancelOrder,
  onHoldOrder,
}: {
  order: Order;
  products: Product[];
  deliveryLabel: string;
  totalQty: number;
  confirmCancel: boolean;
  setConfirmCancel: (v: boolean) => void;
  isStatusPending: boolean;
  onConfirmOrder: () => void;
  onMarkDone: () => void;
  onCancelOrder: () => void;
  onHoldOrder: () => void;
}) {
  return (
    <section className={cardCls} aria-label="Trạng thái giao hàng">
      <div className="flex items-center gap-2 px-4 pt-4">
        <span
          aria-hidden
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
            order.status === "done"
              ? "bg-[#dcf2e3]"
              : order.status === "cancelled"
                ? "bg-[#e9f1f9]"
                : "bg-[#fdf0d3]"
          }`}
        >
          ◌
        </span>
        <h2 className="font-semibold">
          {deliveryLabel} ({totalQty})
        </h2>
      </div>
      <div className="divide-y divide-[var(--border)] px-4">
        {order.items.map((it) => {
          const product = products.find((p) => p.id === it.productId);
          return (
            <div key={it.id} className="flex items-center gap-3 py-3">
              <OrderItemThumb product={product} item={it} size={48} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--accent)]">{it.productName}</p>
                <p className="text-sm text-[var(--dim)]">
                  {it.colorName} · Tỉ lệ {it.scale}
                </p>
                <p className="font-mono text-xs text-[var(--dim)]">
                  SKU: {it.variantSku ?? it.productSku ?? "—"}
                </p>
              </div>
              <p className="text-sm whitespace-nowrap">
                {fmtVND(it.unitPrice)} <span className="text-[var(--dim)]">× {it.quantity}</span>
              </p>
              <p className="w-24 text-right text-sm font-medium whitespace-nowrap">
                {fmtVND(it.unitPrice * it.quantity)}
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--border)] px-4 py-3">
        {order.status === "done" && (
          <p className="text-sm text-[var(--dim)]">Đơn đã giao và hoàn thành.</p>
        )}
        {order.status === "cancelled" && (
          <p className="text-sm text-[var(--dim)]">
            Đơn đã hủy — tồn kho đã cộng lại đúng màu.
          </p>
        )}
        {(order.status === "new" || order.status === "confirmed") &&
          (confirmCancel ? (
            <>
              <span className="text-sm text-[#9c2b2b]">
                Hủy đơn sẽ cộng lại tồn kho đúng màu đã trừ.
              </span>
              <button
                type="button"
                disabled={isStatusPending}
                onClick={onCancelOrder}
                className="rounded-lg bg-[#c0392b] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Chắc chắn hủy
              </button>
              <button
                type="button"
                disabled={isStatusPending}
                onClick={() => setConfirmCancel(false)}
                className={smallBtn}
              >
                Không hủy
              </button>
            </>
          ) : (
            <>
              {order.status === "new" && (
                <>
                  <button
                    type="button"
                    onClick={onHoldOrder}
                    className={smallBtn}
                  >
                    Giữ đơn
                  </button>
                  <button
                    type="button"
                    disabled={isStatusPending}
                    onClick={onConfirmOrder}
                    className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Xác nhận đơn
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Xác nhận đơn trước rồi mới đánh dấu đã giao được"
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium opacity-50"
                  >
                    Đánh dấu đã giao
                  </button>
                </>
              )}
              {order.status === "confirmed" && (
                <button
                  type="button"
                  disabled={isStatusPending}
                  onClick={onMarkDone}
                  className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Đánh dấu đã giao
                </button>
              )}
              <button
                type="button"
                disabled={isStatusPending}
                onClick={() => setConfirmCancel(true)}
                className="rounded-lg border border-[#e3b3b3] px-3 py-1.5 text-sm text-[#9c2b2b] disabled:opacity-50"
              >
                Hủy đơn
              </button>
            </>
          ))}
      </div>
    </section>
  );
}
