import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Discount } from "../types";
import { labelCls, inputCls } from "./shared";

export function DiscountEditor({
  discount,
  onClose,
  onSaved,
}: {
  discount: Discount | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState(discount?.code ?? "");
  const [kind, setKind] = useState<string>(discount?.kind ?? "percent");
  const [value, setValue] = useState(discount ? String(discount.value) : "");
  const [isActive, setIsActive] = useState(discount?.isActive ?? true);
  const [note, setNote] = useState(discount?.note ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: () =>
      api.adminUpsertDiscount({
        id: discount?.id ?? null,
        code: code.trim(),
        kind: kind as "percent" | "fixed",
        value: Number(value.replace(/[^\d]/g, "") || "0"),
        isActive,
        note: note.trim(),
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không lưu được mã.");
        return;
      }
      queryClient.invalidateQueries();
      onSaved(`Đã lưu mã ${code.trim().toUpperCase()} — web khách áp dụng ngay.`);
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={discount ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
    >
      <div className="w-full max-w-md rounded-t-2xl border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)] sm:rounded-2xl">
        <h2 className="text-lg font-bold">
          {discount ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className={labelCls} htmlFor="de-code">
              Mã
            </label>
            <input
              id="de-code"
              className={inputCls}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ví dụ: SALE20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="de-kind">
                Kiểu giảm
              </label>
              <select
                id="de-kind"
                className={inputCls}
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                <option value="percent">Theo %</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="de-value">
                {kind === "percent" ? "Giảm (%)" : "Giảm (₫)"}
              </label>
              <input
                id="de-value"
                className={inputCls}
                inputMode="numeric"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={kind === "percent" ? "10" : "50000"}
              />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="de-note">
              Ghi chú
            </label>
            <input
              id="de-note"
              className={inputCls}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            Đang bật (khách áp được)
          </label>
        </div>
        {formError && (
          <p className="mt-4 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
            {formError}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={saveMut.isPending}
            onClick={() => {
              if (code.trim().length < 2)
                return setFormError("Mã cần ít nhất 2 ký tự.");
              if (!value || Number(value) <= 0)
                return setFormError("Giá trị giảm phải lớn hơn 0.");
              setFormError(null);
              saveMut.mutate();
            }}
            className="flex-1 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saveMut.isPending ? "Đang lưu…" : "Lưu mã"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

