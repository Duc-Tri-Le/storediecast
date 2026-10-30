import { useState } from "react";
import type { Order } from "../types";
import { fmtDate, fmtVND } from "../utils/format";
import { cardCls, editLink, inputCls, labelCls, smallBtn } from "./shared";
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

export function OrderCustomerSection({
  customerName,
  customerPhone,
  customerOrderCount,
  onSave,
  isPending,
}: {
  customerName: string;
  customerPhone: string;
  customerOrderCount: number;
  onSave: (data: { customerName: string; customerPhone: string }) => void;
  isPending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(customerName);
  const [phoneDraft, setPhoneDraft] = useState(customerPhone);

  return (
    <section className={`${cardCls} p-4`} aria-label="Khách hàng">
      <h3 className="font-semibold">Khách hàng</h3>
      {editing ? (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelCls} htmlFor="od-cname">Tên khách hàng</label>
            <input
              id="od-cname"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="od-cphone">Số điện thoại</label>
            <input
              id="od-cphone"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                onSave({ customerName: nameDraft, customerPhone: phoneDraft });
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
        <>
          <p className="mt-2 font-medium text-[var(--accent)]">{customerName}</p>
          <p className="text-sm text-[var(--dim)]">{customerOrderCount} đơn hàng</p>
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold tracking-wide text-[var(--dim)] uppercase">
                Thông tin liên hệ
              </h4>
              <button
                type="button"
                className={editLink}
                onClick={() => {
                  setNameDraft(customerName);
                  setPhoneDraft(customerPhone);
                  setEditing(true);
                }}
              >
                Sửa
              </button>
            </div>
            <p className="mt-1 text-sm">{customerPhone}</p>
          </div>
        </>
      )}
    </section>
  );
}

export function OrderAddressSection({
  customerName,
  customerAddress,
  customerPhone,
  onSave,
  onCopy,
  isPending,
}: {
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  onSave: (address: string) => void;
  onCopy: (text: string, msg: string) => void;
  isPending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [addressDraft, setAddressDraft] = useState(customerAddress);

  return (
    <section className={`${cardCls} p-4`} aria-label="Địa chỉ giao hàng">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold tracking-wide text-[var(--dim)] uppercase">
          Địa chỉ giao hàng
        </h4>
        {!editing && (
          <button
            type="button"
            className={editLink}
            onClick={() => {
              setAddressDraft(customerAddress);
              setEditing(true);
            }}
          >
            Sửa
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-2">
          <label className="sr-only" htmlFor="od-address">Địa chỉ giao hàng</label>
          <textarea
            id="od-address"
            rows={3}
            value={addressDraft}
            onChange={(e) => setAddressDraft(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                onSave(addressDraft);
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
        <div className="mt-2 flex items-start justify-between gap-2">
          <p className="text-sm leading-6">
            {customerName}
            <br />
            {customerAddress}
            <br />
            {customerPhone}
          </p>
          <button
            type="button"
            aria-label="Sao chép địa chỉ giao hàng"
            title="Sao chép địa chỉ"
            onClick={() =>
              onCopy(
                `${customerName}, ${customerAddress}, ${customerPhone}`,
                "Đã sao chép địa chỉ giao hàng.",
              )
            }
            className="rounded border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--sidebar)]"
          >
            Sao chép
          </button>
        </div>
      )}
      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <h4 className="text-xs font-semibold tracking-wide text-[var(--dim)] uppercase">
          Địa chỉ thanh toán
        </h4>
        <p className="mt-1 text-sm text-[var(--dim)]">Giống địa chỉ giao hàng</p>
      </div>
    </section>
  );
}

export function OrderTimelineSection({
  order,
}: {
  order: Order;
}) {
  const timeline: Array<{ title: string; sub: string }> = [
    {
      title: "Đơn hàng được tạo",
      sub: `${fmtDate(order.createdAt)} · Nguồn: Web bán hàng`,
    },
    {
      title: "Thanh toán bằng chuyển khoản",
      sub:
        order.status === "done"
          ? "Đã thanh toán"
          : order.status === "cancelled"
            ? "Đơn đã hủy"
            : "Chờ khách chuyển khoản",
    },
  ];
  if (order.status === "confirmed" || order.status === "done") {
    timeline.push({ title: "Đơn đã được xác nhận", sub: "Shop đang chuẩn bị hàng" });
  }
  if (order.status === "done") {
    timeline.push({ title: "Đã giao hàng — đơn hoàn thành", sub: "Trạng thái hiện tại" });
  }
  if (order.status === "cancelled") {
    timeline.push({
      title: "Đơn đã hủy",
      sub: "Tồn kho đã được cộng lại đúng màu đã trừ",
    });
  }

  return (
    <section className={`${cardCls} p-4`} aria-label="Lịch sử đơn">
      <h3 className="font-semibold">Lịch sử đơn</h3>
      <ol className="mt-3 space-y-4 border-l-2 border-[var(--border)] pl-4">
        {timeline.map((ev, i) => (
          <li key={i} className="relative">
            <span
              aria-hidden
              className="absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full bg-[var(--accent)]"
            />
            <p className="text-sm font-medium">{ev.title}</p>
            <p className="text-xs text-[var(--dim)]">{ev.sub}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export { OrderPrintModal } from "./OrderPrintModal";
