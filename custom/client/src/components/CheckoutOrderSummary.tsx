import type { CartLine } from "../types";
import { resolveProductImage } from "../data/maps";
import {
  effectivePrice,
  fmt,
  variantPrice,
  type AppliedCoupon,
} from "../services/pricing";
import { CouponField } from "./CouponField";

export function CheckoutOrderSummary({
  items,
  effectiveTotalQty,
  effectiveBulkPct,
  subtotalBefore,
  bulkDiscount,
  subtotal,
  couponCode,
  couponDiscount,
  subtotalAfterCoupon,
  shipping,
  total,
  onApplyCoupon,
  onRemoveCoupon,
}: {
  items: CartLine[];
  effectiveTotalQty: number;
  effectiveBulkPct: number;
  subtotalBefore: number;
  bulkDiscount: number;
  subtotal: number;
  couponCode: string | null;
  couponDiscount: number;
  subtotalAfterCoupon: number;
  shipping: number;
  total: number;
  onApplyCoupon: (coupon: AppliedCoupon) => void;
  onRemoveCoupon: () => void;
}) {
  return (
    <section
      aria-label="Tóm tắt đơn hàng"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <h2 className="text-base font-black uppercase tracking-wide text-[var(--accent)]">
        Đơn của bạn
      </h2>
      <p role="status" className="mt-2 text-sm font-semibold">
        {effectiveBulkPct > 0 ? (
          <>Tổng số lượng: {effectiveTotalQty} chiếc — giảm {effectiveBulkPct}% trên tổng tạm tính của cả đơn</>
        ) : (
          <>Tổng số lượng: {effectiveTotalQty} chiếc</>
        )}
      </p>
      <ul className="mt-4 divide-y divide-[var(--border)]">
        {items.map(({ product: p, variant: v, qty, key }) => {
          const lineColor = v ? v.colorName : p.colorName;
          const lineUnit = v ? variantPrice(v) : effectivePrice(p);
          return (
            <li key={key} className="flex gap-3 py-3">
              <img
                src={resolveProductImage(v ? v.imageKey : p.imageKey)}
                alt=""
                className="h-12 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="text-xs text-[var(--dim)]">
                  {p.brand} · Tỉ lệ {p.scale} · Màu {lineColor} × {qty} · {fmt(lineUnit)}/chiếc
                </p>
              </div>
              <span className="text-sm font-black tabular-nums">{fmt(lineUnit * qty)}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <CouponField
          idPrefix="checkout"
          appliedCode={couponCode}
          discountAmount={couponDiscount}
          subtotalAfterBulk={subtotal}
          onApply={onApplyCoupon}
          onRemove={onRemoveCoupon}
        />
      </div>
      <div className="mt-3 space-y-1.5 border-t border-[var(--border)] pt-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-[var(--dim)]">Tổng số lượng</span>
          <span className="font-semibold tabular-nums">{effectiveTotalQty} chiếc</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[var(--dim)]">Tạm tính</span>
          <span className="font-semibold tabular-nums">{fmt(subtotalBefore)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[var(--dim)]">Giảm theo số lượng ({effectiveBulkPct}%)</span>
          <span className="font-semibold tabular-nums text-[var(--accent)]">
            −{fmt(bulkDiscount)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[var(--dim)]">Tạm tính sau giảm theo số lượng</span>
          <span className="font-semibold tabular-nums">{fmt(subtotal)}</span>
        </div>
        {couponCode && (
          <>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--dim)]">Giảm giá mã {couponCode}</span>
              <span className="font-semibold tabular-nums text-[var(--accent)]">
                −{fmt(couponDiscount)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--dim)]">Tạm tính sau mã</span>
              <span className="font-semibold tabular-nums">{fmt(subtotalAfterCoupon)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between gap-3">
          <span className="text-[var(--dim)]">Phí ship</span>
          <span className="font-semibold tabular-nums">
            {shipping === 0 ? "Miễn phí" : fmt(shipping)}
          </span>
        </div>
        <div className="flex justify-between gap-3 border-t border-[var(--border)] pt-2 text-base">
          <span className="font-bold">Tổng cộng</span>
          <span className="font-black tabular-nums text-[var(--accent)]">{fmt(total)}</span>
        </div>
      </div>
    </section>
  );
}

