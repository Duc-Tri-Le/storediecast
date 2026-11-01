import { useState, useEffect } from "react";
import { cardCls, editLink, inputCls, labelCls, smallBtn } from "./shared";

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

  useEffect(() => {
    setNameDraft(customerName);
    setPhoneDraft(customerPhone);
  }, [customerName, customerPhone]);

  return (
    <section className={`${cardCls} p-4`} aria-label="Khách hàng">
      <h3 className="font-semibold text-base">Khách hàng</h3>
      {editing ? (
        <div className="mt-2 space-y-2">
          <div>
            <label className={labelCls} htmlFor="od-cname">
              Tên khách hàng
            </label>
            <input
              id="od-cname"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className={inputCls}
              placeholder="Nhập tên khách hàng"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="od-cphone">
              Số điện thoại
            </label>
            <input
              id="od-cphone"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              className={inputCls}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                onSave({ customerName: nameDraft, customerPhone: phoneDraft });
                setEditing(false);
              }}
              className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPending ? "Đang lưu…" : "Lưu"}
            </button>
            <button
              type="button"
              onClick={() => {
                setNameDraft(customerName);
                setPhoneDraft(customerPhone);
                setEditing(false);
              }}
              className={smallBtn}
            >
              Hủy sửa
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 font-medium text-[var(--accent)]">
            {customerName || "Khách chưa đặt tên"}
          </p>
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
            {customerPhone ? (
              <p className="mt-1 text-sm font-medium">
                <a
                  href={`tel:${customerPhone}`}
                  className="hover:underline hover:text-[var(--accent)]"
                  title="Gọi cho khách hàng"
                >
                  {customerPhone}
                </a>
              </p>
            ) : (
              <p className="mt-1 text-sm text-[var(--dim)] italic">Chưa có số điện thoại</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

