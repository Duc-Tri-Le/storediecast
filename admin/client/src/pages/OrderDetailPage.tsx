import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Order, Product } from "../types";
import { fmtDate, fmtVND, orderCode, STATUS_LABEL } from "../utils/format";
import { cardCls, smallBtn, Thumb } from "../components/shared";
import { deliveryChip, paymentChip } from "../components/OrderComponents";
import {
  OrderAddressSection,
  OrderCustomerSection,
  OrderNoteSection,
  OrderPaymentSection,
  OrderPrintModal,
  OrderTimelineSection,
} from "../components/OrderDetailCards";

export function OrderDetailPage({
  order,
  allOrders,
  products,
  onBack,
}: {
  order: Order;
  allOrders: Order[];
  products: Product[];
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
  const customerOrderCount = allOrders.filter(
    (o) => o.customerPhone === order.customerPhone,
  ).length;

  const deliveryLabel =
    order.status === "new"
      ? "Chưa giao"
      : order.status === "confirmed"
        ? "Đang chuẩn bị giao"
        : order.status === "done"
          ? "Đã giao hàng"
          : "Đã hủy";

  const statusMut = useMutation({
    mutationFn: (status: "confirmed" | "done" | "cancelled") =>
      api.adminUpdateOrderStatus({ orderId: order.id, status }),
    onSuccess: (res) => {
      if (!res.ok) {
        setActionError(res.error ?? "Không đổi được trạng thái đơn.");
      } else {
        setActionError(null);
        setConfirmCancel(false);
        setMoreOpen(false);
        setNotice("Đã cập nhật trạng thái đơn vào database chung.");
        queryClient.invalidateQueries();
      }
    },
    onError: (e) => setActionError(e instanceof Error ? e.message : String(e)),
  });

  const infoMut = useMutation({
    mutationFn: (args: {
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      note: string;
    }) => api.adminUpdateOrderInfo({ orderId: order.id, ...args }),
    onSuccess: (res) => {
      if (!res.ok) {
        setActionError(res.error ?? "Không lưu được thay đổi.");
      } else {
        setActionError(null);
        setNotice("Đã lưu thay đổi vào database chung.");
        queryClient.invalidateQueries();
      }
    },
    onError: (e) => setActionError(e instanceof Error ? e.message : String(e)),
  });

  const saveInfo = (patch: Partial<{
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    note: string;
  }>) =>
    infoMut.mutate({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      note: order.note,
      ...patch,
    });

  const copyText = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(msg);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setNotice(msg);
      } catch {
        setNotice(`Không tự sao chép được — nội dung: ${text}`);
      }
      document.body.removeChild(ta);
    }
  };

  const statusSummary = `Đơn ${orderCode(order.id)} — ${STATUS_LABEL[order.status] ?? order.status} — Tổng ${fmtVND(order.total)}`;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 rounded-md bg-[var(--sidebar)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--dim)] uppercase hover:text-[var(--text)]"
      >
        ‹ Đơn hàng
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Đơn {orderCode(order.id)}</h1>
        {paymentChip(order.status)}
        {deliveryChip(order.status)}
      </div>
      <p className="mt-1 text-sm text-[var(--dim)]">
        {fmtDate(order.createdAt)} · từ Web bán hàng
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPrintOpen(true)} className={smallBtn}>
          In đơn
        </button>
        <button
          type="button"
          onClick={() =>
            void copyText(statusSummary, "Đã sao chép thông tin trạng thái đơn.")
          }
          className={smallBtn}
        >
          Sao chép link trang trạng thái đơn
        </button>
        <div className="relative">
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
            className={smallBtn}
          >
            Thêm hành động ▾
          </button>
          {moreOpen && (
            <div className="absolute left-0 z-30 mt-1 w-60 overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] bg-white shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  setPrintOpen(true);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--sidebar)]"
              >
                In đơn
              </button>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  void copyText(
                    `${order.customerName} · ${order.customerPhone} · ${order.customerAddress}`,
                    "Đã sao chép thông tin khách hàng.",
                  );
                }}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--sidebar)]"
              >
                Sao chép thông tin khách hàng
              </button>
              {(order.status === "new" || order.status === "confirmed") && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    setConfirmCancel(true);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-[#9c2b2b] hover:bg-[#fdf3f3]"
                >
                  Hủy đơn
                </button>
              )}
            </div>
          )}
        </div>
        <button type="button" onClick={onBack} className={smallBtn}>
          Quay lại Đơn hàng
        </button>
      </div>

      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">{notice}</p>
      )}
      {actionError && (
        <p className="mt-4 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          {actionError}
        </p>
      )}

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Cột trái */}
        <div className="min-w-0 space-y-4">
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
                    {product ? (
                      <Thumb product={product} size={48} />
                    ) : (
                      <span
                        aria-hidden
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[9px] font-semibold text-[var(--dim)]"
                      >
                        {it.scale}
                      </span>
                    )}
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
                      disabled={statusMut.isPending}
                      onClick={() => statusMut.mutate("cancelled")}
                      className="rounded-lg bg-[#c0392b] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Chắc chắn hủy
                    </button>
                    <button
                      type="button"
                      disabled={statusMut.isPending}
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
                          onClick={() =>
                            setNotice(
                              `Đơn ${orderCode(order.id)} đang được giữ ở trạng thái Mới — chưa xác nhận, hàng chưa trừ thêm và khách chưa bị tính là đã giao.`,
                            )
                          }
                          className={smallBtn}
                        >
                          Giữ đơn
                        </button>
                        <button
                          type="button"
                          disabled={statusMut.isPending}
                          onClick={() => statusMut.mutate("confirmed")}
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
                        disabled={statusMut.isPending}
                        onClick={() => statusMut.mutate("done")}
                        className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Đánh dấu đã giao
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={statusMut.isPending}
                      onClick={() => setConfirmCancel(true)}
                      className="rounded-lg border border-[#e3b3b3] px-3 py-1.5 text-sm text-[#9c2b2b] disabled:opacity-50"
                    >
                      Hủy đơn
                    </button>
                  </>
                ))}
            </div>
          </section>

          <OrderPaymentSection order={order} totalQty={totalQty} />
        </div>

        {/* Cột phải */}
        <div className="space-y-4">
          <OrderNoteSection
            note={order.note}
            onSave={(note) => saveInfo({ note })}
            isPending={infoMut.isPending}
          />

          <OrderCustomerSection
            customerName={order.customerName}
            customerPhone={order.customerPhone}
            customerOrderCount={customerOrderCount}
            onSave={({ customerName, customerPhone }) =>
              saveInfo({ customerName, customerPhone })
            }
            isPending={infoMut.isPending}
          />

          <OrderAddressSection
            customerName={order.customerName}
            customerAddress={order.customerAddress}
            customerPhone={order.customerPhone}
            onSave={(customerAddress) => saveInfo({ customerAddress })}
            onCopy={copyText}
            isPending={infoMut.isPending}
          />

          <OrderTimelineSection order={order} />
        </div>
      </div>

      {printOpen && (
        <OrderPrintModal order={order} onClose={() => setPrintOpen(false)} />
      )}
    </div>
  );
}

