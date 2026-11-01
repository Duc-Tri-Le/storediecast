import { useState } from "react";
import type { Order } from "../types";
import { fmtDate, fmtVND } from "../utils/format";
import { cardCls, editLink, smallBtn } from "./shared";
import { paymentChip } from "./OrderComponents";

export function OrderPaymentSection({
  order,
  totalQty,
}: {
  order: Order;
  totalQty: number;
}) {
  return (
    <section className={cardCls} aria-label="Thanh toán">
      <div className="flex items-center gap-2 px-4 pt-4">
        <span
          aria-hidden
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fdf0d3] text-sm"
        >
          ◌
        </span>
        <h2 className="font-semibold">Thanh toán</h2>
        <span className="ml-auto">{paymentChip(order.status)}</span>
      </div>
      <dl className="space-y-2 px-4 py-4 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--dim)]">Tạm tính</dt>
          <dd className="text-[var(--dim)]">{totalQty} sản phẩm</dd>
          <dd className="w-28 text-right">{fmtVND(order.subtotalBeforeBulk)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--dim)]">
            Giảm theo số lượng{order.bulkPct > 0 ? ` (${order.bulkPct}%)` : ""}
          </dt>
          <dd className="w-28 text-right">
            {order.bulkDiscountAmount > 0
              ? `−${fmtVND(order.bulkDiscountAmount)}`
              : fmtVND(0)}
          </dd>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[var(--dim)]">
              Giảm mã{order.discountCode ? ` ${order.discountCode}` : ""}
            </dt>
            <dd className="w-28 text-right">−{fmtVND(order.discountAmount)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[var(--dim)]">Phí vận chuyển</dt>
          <dd className="w-28 text-right">
            {order.shippingFee === 0 ? "Miễn phí" : fmtVND(order.shippingFee)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-2 font-bold">
          <dt>Tổng</dt>
          <dd className="w-28 text-right">{fmtVND(order.total)}</dd>
        </div>
      </dl>
      <div className="flex items-baseline justify-between gap-3 border-t border-[var(--border)] px-4 py-3 text-sm">
        <p className="text-[var(--dim)]">
          Phương thức thanh toán: <span className="text-[var(--text)]">Chuyển khoản</span>
        </p>
        <p>
          {order.status === "done" ? "Đã thanh toán" : "Khách cần trả"}{" "}
          <span className="font-semibold">{fmtVND(order.total)}</span>
        </p>
      </div>
    </section>
  );
}

export function OrderNoteSection({
  note,
  onSave,
  isPending,
}: {
  note: string;
  onSave: (note: string) => void;
  isPending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  return (
    <section className={`${cardCls} p-4`} aria-label="Ghi chú">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Ghi chú</h3>
        {!editing && (
          <button
            type="button"
            className={editLink}
            onClick={() => {
              setDraft(note);
              setEditing(true);
            }}
          >
            Sửa
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-2">
          <label className="sr-only" htmlFor="od-note">Ghi chú đơn hàng</label>
          <textarea
            id="od-note"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                onSave(draft);
                setEditing(false);
              }}
              className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Lưu
            </button>
            <button type="button" onClick={() => setEditing(false)} className={smallBtn}>
              Hủy sửa
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm text-[var(--dim)]">
          {note ? note : "Không có ghi chú từ khách hàng"}
        </p>
      )}
    </section>
  );
}

export { OrderCustomerSection } from "./OrderCustomerSection";
export { OrderAddressSection } from "./OrderAddressSection";

export function OrderTimelineSection({
  order,
}: {
  order: Order;
}) {
  const createdTime = order.createdAt ? fmtDate(order.createdAt) : "";
  const confirmedTime = order.confirmedAt
    ? fmtDate(order.confirmedAt)
    : (order.status === "confirmed" || order.status === "done") && order.updatedAt
      ? fmtDate(order.updatedAt)
      : "";
  const doneTime = order.doneAt
    ? fmtDate(order.doneAt)
    : order.status === "done" && order.updatedAt
      ? fmtDate(order.updatedAt)
      : "";
  const cancelledTime = order.cancelledAt
    ? fmtDate(order.cancelledAt)
    : order.status === "cancelled" && order.updatedAt
      ? fmtDate(order.updatedAt)
      : "";

  type TimelineEvent = {
    title: string;
    time: string;
    sub: string;
    tone: "blue" | "green" | "red" | "amber" | "gray";
  };

  const timeline: TimelineEvent[] = [
    {
      title: "Đơn hàng được tạo",
      time: createdTime,
      sub: "Đặt mua thành công từ Web bán hàng",
      tone: "blue",
    },
    {
      title: order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán bằng chuyển khoản",
      time: order.status === "done" ? (doneTime || confirmedTime || createdTime) : "",
      sub:
        order.status === "done"
          ? "Đã thanh toán thành công"
          : order.status === "cancelled"
            ? "Đơn đã hủy, không phát sinh thanh toán"
            : order.paymentMethod === "cod"
              ? "Thu tiền khi giao hàng"
              : "Chờ khách chuyển khoản vào tài khoản shop",
      tone: order.status === "done" ? "green" : order.status === "cancelled" ? "gray" : "amber",
    },
  ];

  if (order.status === "confirmed" || order.status === "done") {
    timeline.push({
      title: "Đơn đã được xác nhận",
      time: confirmedTime,
      sub: "Shop đã kiểm tra và chuẩn bị đóng gói hàng",
      tone: "blue",
    });
  }

  if (order.status === "done") {
    timeline.push({
      title: "Đã giao hàng — đơn hoàn thành",
      time: doneTime,
      sub: "Khách đã nhận được kiện hàng và giao dịch hoàn tất",
      tone: "green",
    });
  }

  if (order.status === "cancelled") {
    timeline.push({
      title: "Đơn đã hủy",
      time: cancelledTime,
      sub: "Đơn hàng đã hủy bỏ và tồn kho đã được hoàn lại",
      tone: "red",
    });
  }

  const dotCls = (tone: TimelineEvent["tone"]) => {
    switch (tone) {
      case "green":
        return "bg-emerald-600 ring-emerald-100";
      case "red":
        return "bg-red-500 ring-red-100";
      case "amber":
        return "bg-amber-500 ring-amber-100";
      case "gray":
        return "bg-gray-400 ring-gray-100";
      default:
        return "bg-[var(--accent)] ring-blue-100";
    }
  };

  return (
    <section className={`${cardCls} p-4`} aria-label="Lịch sử đơn">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
        <h3 className="font-semibold text-sm">Lịch sử đơn hàng</h3>
        <span className="text-xs text-[var(--dim)] font-medium">
          {timeline.length} sự kiện
        </span>
      </div>
      <ol className="mt-4 space-y-4 border-l-2 border-[var(--border)] pl-4">
        {timeline.map((ev, i) => (
          <li key={i} className="relative">
            <span
              aria-hidden
              className={`absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full ring-4 ${dotCls(ev.tone)}`}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--text)]">{ev.title}</p>
              {ev.time && (
                <time className="text-xs font-mono font-medium text-[var(--accent)] bg-[var(--sidebar)] px-2 py-0.5 rounded border border-[var(--border)]/60">
                  {ev.time}
                </time>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[var(--dim)]">{ev.sub}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export { OrderPrintModal } from "./OrderPrintModal";
