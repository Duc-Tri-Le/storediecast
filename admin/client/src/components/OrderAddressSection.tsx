import { useState, useEffect } from "react";
import { cardCls, editLink, smallBtn } from "./shared";

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

  useEffect(() => {
    setAddressDraft(customerAddress);
  }, [customerAddress]);

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
          <label className="sr-only" htmlFor="od-address">
            Địa chỉ giao hàng
          </label>
          <textarea
            id="od-address"
            rows={3}
            value={addressDraft}
            onChange={(e) => setAddressDraft(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            placeholder="Nhập địa chỉ giao hàng đầy đủ"
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
              {isPending ? "Đang lưu…" : "Lưu"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAddressDraft(customerAddress);
                setEditing(false);
              }}
              className={smallBtn}
            >
              Hủy sửa
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="text-sm leading-6">
            <p className="font-medium text-[var(--text)]">{customerName || "Khách chưa đặt tên"}</p>
            <p className={customerAddress ? "text-[var(--text)]" : "text-[var(--dim)] italic"}>
              {customerAddress || "Chưa có địa chỉ giao hàng"}
            </p>
            {customerPhone && <p className="text-[var(--dim)]">{customerPhone}</p>}
          </div>
          {customerAddress && (
            <button
              type="button"
              aria-label="Sao chép địa chỉ giao hàng"
              title="Sao chép địa chỉ"
              onClick={() =>
                onCopy(
                  `${customerName ? customerName + ", " : ""}${customerAddress}${customerPhone ? ", " + customerPhone : ""}`,
                  "Đã sao chép địa chỉ giao hàng.",
                )
              }
              className="shrink-0 rounded border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--sidebar)]"
            >
              Sao chép
            </button>
          )}
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

