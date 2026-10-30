import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../api";
import type { Order } from "../types";
import { fmt } from "../services/pricing";

export const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  confirmed: "Đã xác nhận",
  done: "Hoàn thành",
  cancelled: "Đã hủy",
};

export function OrdersView({ onShop, invalidate }: { onShop: () => void; invalidate: () => void }) {
  const [phone, setPhone] = useState("");
  const [appliedPhone, setAppliedPhone] = useState("");
  const ordersQ = useQuery({
    queryKey: ["orders", appliedPhone],
    queryFn: () => api.listOrders({ phone: appliedPhone }),
  });

  const [cancelError, setCancelError] = useState<string | null>(null);
  const statusMut = useMutation({
    mutationFn: (args: { orderId: number }) =>
      api.updateOrderStatus({ orderId: args.orderId, phone: appliedPhone, status: "cancelled" }),
    onSuccess: (res) => {
      setCancelError(res.ok ? null : (res.error ?? "Không hủy được đơn."));
      invalidate();
    },
  });

  const orders: Order[] = ordersQ.data?.orders ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <h1 className="text-3xl font-black tracking-tight">Tra cứu đơn hàng</h1>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--dim)]">
        Nhập đúng số điện thoại đã dùng khi đặt hàng để xem thông tin đơn của bạn: trạng thái,
        địa chỉ giao, tổng tiền và các mẫu xe trong đơn. Vì riêng tư, trang này không hiển thị đơn của người khác.
      </p>
      {cancelError && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">
          {cancelError}
        </p>
      )}
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setAppliedPhone(phone.trim());
        }}
      >
        <label className="sr-only" htmlFor="order-phone">Số điện thoại tra cứu đơn</label>
        <input
          id="order-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Số điện thoại đã đặt hàng"
          inputMode="tel"
          className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button type="submit" className="shrink-0 rounded-full bg-[var(--dark)] px-5 py-3 text-sm font-bold text-white">
          Tra cứu
        </button>
        {appliedPhone && (
          <button
            type="button"
            onClick={() => {
              setPhone("");
              setAppliedPhone("");
            }}
            className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold"
          >
            Xóa tra cứu
          </button>
        )}
      </form>

      <div className="mt-6 grid gap-3 rounded-2xl bg-[var(--surface)] p-5 text-sm md:grid-cols-3 border border-[var(--border)]">
        <div>
          <p className="font-bold">Trạng thái “Mới”</p>
          <p className="mt-1 text-[var(--dim)]">Shop chưa xử lý — bạn tự hủy được ngay trên trang này, kho sẽ cộng lại.</p>
        </div>
        <div>
          <p className="font-bold">“Đã xác nhận” / “Hoàn thành”</p>
          <p className="mt-1 text-[var(--dim)]">Shop đã gọi xác nhận hoặc đã giao xong. Cần đổi thông tin, hãy liên hệ shop bằng số đã đặt.</p>
        </div>
        <div>
          <p className="font-bold">Không thấy đơn?</p>
          <p className="mt-1 text-[var(--dim)]">Kiểm tra lại số điện thoại — chỉ đơn đặt bằng đúng số đó mới hiện ở đây.</p>
        </div>
      </div>

      {ordersQ.isPending ? (
        <p className="mt-10 text-center text-sm text-[var(--dim)]">Đang tải đơn hàng…</p>
      ) : ordersQ.error ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <p className="font-semibold">Chưa tải được đơn hàng.</p>
          <button type="button" onClick={() => void ordersQ.refetch()} className="mt-3 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white">
            Thử tải lại
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <p className="font-semibold">
            {appliedPhone
              ? "Chưa có đơn nào với số điện thoại này."
              : "Nhập số điện thoại để xem đơn của bạn."}
          </p>
          <p className="mt-1 text-sm text-[var(--dim)]">
            {appliedPhone
              ? "Kiểm tra lại số đã nhập, hoặc đặt đơn đầu tiên từ trang Sản phẩm."
              : "Đơn chỉ hiển thị cho đúng số điện thoại đã đặt — shop không công khai danh sách đơn của khách."}
          </p>
          <button type="button" onClick={onShop} className="mt-4 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white">
            Đi chọn mô hình
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {orders.map((o) => (
            <article key={o.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-black">Đơn #{o.id}</h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    o.status === "cancelled"
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
                      : o.status === "done"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                        : o.status === "confirmed"
                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                  }`}
                >
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
                <span className="text-xs text-[var(--dim)]">
                  {new Date(o.createdAt).toLocaleString("vi-VN")}
                </span>
                <span className="ml-auto font-black tabular-nums text-[var(--accent)]">{fmt(o.total)}</span>
              </div>
              <p className="mt-2 text-sm">
                <span className="font-semibold">{o.customerName}</span> · {o.customerPhone}
              </p>
              <p className="text-sm text-[var(--dim)]">{o.customerAddress}</p>
              {o.note && <p className="text-sm text-[var(--dim)]">Ghi chú: {o.note}</p>}
              <ul className="mt-3 space-y-1.5 border-t border-[var(--border)] pt-3 text-sm">
                {o.items.map((it: Order["items"][number]) => (
                  <li key={it.id} className="flex justify-between gap-3">
                    <span>
                      {it.productName}{" "}
                      <span className="text-[var(--dim)]">
                        ({it.scale}
                        {it.colorName ? ` · Màu ${it.colorName}` : ""}) × {it.quantity}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">{fmt(it.unitPrice * it.quantity)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-3 border-t border-[var(--border)] pt-2 text-[var(--dim)]">
                  <span>Tạm tính</span>
                  <span className="tabular-nums">{fmt(o.subtotalBeforeBulk)}</span>
                </li>
                <li className="flex justify-between gap-3 text-[var(--dim)]">
                  <span>Giảm theo số lượng ({o.bulkPct}%)</span>
                  <span className="tabular-nums">
                    {o.bulkDiscountAmount > 0 ? `−${fmt(o.bulkDiscountAmount)}` : fmt(0)}
                  </span>
                </li>
                <li className="flex justify-between gap-3 text-[var(--dim)]">
                  <span>Tạm tính sau giảm theo số lượng</span>
                  <span className="tabular-nums">{fmt(o.subtotal)}</span>
                </li>
                <li className="flex justify-between gap-3 text-[var(--dim)]">
                  <span>
                    {o.discountCode
                      ? `Giảm giá mã ${o.discountCode}`
                      : "Giảm giá mã"}
                  </span>
                  <span className="tabular-nums">
                    {o.discountCode || o.discountAmount > 0
                      ? `−${fmt(o.discountAmount)}`
                      : "Không áp dụng"}
                  </span>
                </li>
                <li className="flex justify-between gap-3 text-[var(--dim)]">
                  <span>Tạm tính sau mã</span>
                  <span className="tabular-nums">{fmt(o.subtotalAfterCoupon)}</span>
                </li>
                <li className="flex justify-between gap-3 text-[var(--dim)]">
                  <span>Phí ship · Chuyển khoản</span>
                  <span className="tabular-nums">{o.shippingFee === 0 ? "Miễn phí" : fmt(o.shippingFee)}</span>
                </li>
                <li className="flex justify-between gap-3 font-bold">
                  <span>Tổng tiền</span>
                  <span className="tabular-nums">{fmt(o.total)}</span>
                </li>
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {o.status === "new" ? (
                  <>
                    <button type="button" disabled={statusMut.isPending} onClick={() => statusMut.mutate({ orderId: o.id })} aria-label={`Hủy đơn ${o.id} của tôi`} className="rounded-full border border-red-300 px-4 py-2 text-xs font-bold text-red-600 disabled:opacity-50">
                      Hủy đơn của tôi (trả lại kho)
                    </button>
                    <span className="text-xs text-[var(--dim)]">Shop sẽ gọi số này để xác nhận trước khi giao.</span>
                  </>
                ) : o.status === "confirmed" ? (
                  <span className="text-xs text-[var(--dim)]">Shop đã xác nhận — cần đổi/hủy vui lòng liên hệ shop qua số đã đặt.</span>
                ) : o.status === "done" ? (
                  <span className="text-xs text-[var(--dim)]">Đơn đã hoàn thành. Cảm ơn bạn!</span>
                ) : (
                  <span className="text-xs text-[var(--dim)]">Đơn đã hủy.</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
