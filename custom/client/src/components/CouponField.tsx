import { useState } from "react";
import { api } from "../api";
import { fmt, normalizeCouponCode, type AppliedCoupon } from "../services/pricing";

// Ô nhập mã giảm giá dùng chung cho cả 3 nơi. Mã KHÔNG bắt buộc:
// nhãn ghi rõ "(không bắt buộc)" và placeholder nhắc khách không có
// mã thì cứ bỏ qua — để trống ô mã thì nút Đặt hàng vẫn bấm được
// bình thường, không báo lỗi, không chặn đặt hàng và không yêu cầu
// phải bấm Áp dụng trước. Bấm Áp dụng khi ô đang trống cũng KHÔNG
// báo lỗi — chỉ hiện một dòng nhắc nhẹ là cứ để trống và đặt hàng
// bình thường. Chỉ khi khách nhập một mã SAI (có chữ nhưng không
// đúng mã) mới báo "mã không hợp lệ" ngay tại chỗ và KHÔNG gọi
// onApply, nên tổng tiền giữ nguyên; mã sai chưa từng được áp nên
// khách chỉ cần xóa chữ trong ô (hoặc để trống) là đặt được đơn như
// thường. Đã áp mã: hiện mã đã áp, số tiền được giảm (tính lại theo
// tạm tính hiện tại) và nút Gỡ mã để quay về tổng chưa giảm — gỡ rồi
// nhập mã khác chính là cách đổi mã. Đơn không dùng mã thì các khối
// tổng ở cả 3 nơi không hiện dòng giảm giá mã (điều kiện couponCode).
export function CouponField({
  idPrefix,
  appliedCode,
  discountAmount,
  subtotalAfterBulk,
  onApply,
  onRemove,
}: {
  idPrefix: string;
  appliedCode: string | null;
  discountAmount: number;
  subtotalAfterBulk: number;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  // Nhắc nhẹ (KHÔNG phải lỗi) khi khách bấm Áp dụng mà ô mã đang
  // trống: mã không bắt buộc, cứ để trống và đặt hàng bình thường.
  const [hint, setHint] = useState<string | null>(null);

  if (appliedCode) {
    return (
      <div className="rounded-xl border border-[var(--accent)] bg-[var(--surface2)] px-3.5 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 text-sm font-bold">
            <span aria-hidden className="mr-1.5 text-[var(--accent)]">✓</span>
            Mã <span className="tabular-nums">{appliedCode}</span>
          </p>
          <span className="shrink-0 text-sm font-black tabular-nums text-[var(--accent)]">
            −{fmt(discountAmount)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--dim)]">Đang áp dụng cho đơn này.</p>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Gỡ mã giảm giá ${appliedCode} khỏi đơn này`}
            className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-bold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Gỡ mã
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={`${idPrefix}-coupon`} className="text-sm font-semibold">
        Mã giảm giá (không bắt buộc)
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={`${idPrefix}-coupon`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
            if (hint) setHint(null);
          }}
          onKeyDown={(e) => {
            // Enter trong ô mã chỉ áp mã, không gửi cả form đặt hàng.
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder="Có mã thì nhập, không có thì bỏ qua"
          autoComplete="off"
          autoCapitalize="characters"
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm uppercase outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          disabled={checking}
          onClick={() => {
            const code = normalizeCouponCode(input);
            if (code === "") {
              // Ô trống = khách không dùng mã: KHÔNG báo lỗi, chỉ nhắc
              // nhẹ là cứ để trống và bấm Đặt hàng như bình thường.
              setError(null);
              setHint("Chưa nhập mã — không sao, mã không bắt buộc. Cứ để trống và đặt hàng bình thường.");
              return;
            }
            // Hỏi máy chủ: mã có thật và đang bật trong hệ thống quản lý của shop
            // hay không. Mã sai / đã tắt thì báo lỗi tại chỗ và KHÔNG
            // gọi onApply, nên tổng tiền giữ nguyên.
            setChecking(true);
            setHint(null);
            void api
              .validateDiscountCode({ code, subtotalAfterBulk: Math.max(0, Math.round(subtotalAfterBulk)) })
              .then((res) => {
                if (!res.valid || !res.coupon) {
                  setError(res.error ?? "Mã giảm giá không hợp lệ. Kiểm tra lại mã rồi thử lại, hoặc xóa mã này và đặt hàng bình thường — mã không bắt buộc.");
                  return;
                }
                setError(null);
                setInput("");
                onApply(res.coupon);
              })
              .catch(() => {
                setError("Chưa kiểm tra được mã lúc này. Thử lại sau một chút, hoặc đặt hàng bình thường — mã không bắt buộc.");
              })
              .finally(() => setChecking(false));
          }}
          aria-label="Áp dụng mã giảm giá cho đơn này"
          className="shrink-0 rounded-xl bg-[var(--dark)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {checking ? "Đang kiểm tra…" : "Áp dụng"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p role="status" className="mt-2 text-sm text-[var(--dim)]">
          {hint}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--dim)]">
          Không bắt buộc — không có mã thì cứ để trống, vẫn đặt hàng bình thường.
        </p>
      )}
    </div>
  );
}
