import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Order, Product } from "../types";
import { fmtDate, fmtVND, orderCode, STATUS_LABEL } from "../utils/format";
import { BackButton, smallBtn } from "../components/shared";
import { deliveryChip, paymentChip } from "../components/OrderComponents";
import { OrderItemsSection } from "../components/OrderItemsSection";
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
      <BackButton label="Đơn hàng" onClick={onBack} />

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
          <OrderItemsSection
            order={order}
            products={products}
            deliveryLabel={deliveryLabel}
            totalQty={totalQty}
            confirmCancel={confirmCancel}
            setConfirmCancel={setConfirmCancel}
            isStatusPending={statusMut.isPending}
            onConfirmOrder={() => statusMut.mutate("confirmed")}
            onMarkDone={() => statusMut.mutate("done")}
            onCancelOrder={() => statusMut.mutate("cancelled")}
            onHoldOrder={() =>
              setNotice(
                `Đơn ${orderCode(order.id)} đang được giữ ở trạng thái Mới — chưa xác nhận, hàng chưa trừ thêm và khách chưa bị tính là đã giao.`,
              )
            }
          />

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
