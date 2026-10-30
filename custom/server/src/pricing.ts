// ── Công thức tiền của đơn hàng — nguồn sự thật duy nhất phía server ─
// Thứ tự tính (chủ shop chốt, giữ nguyên không đổi):
//   1. Tổng trước giảm = Σ (giá phải trả của từng dòng × số lượng).
//   2. Giảm theo TỔNG số lượng của cả đơn: 2 → 7%, 3–4 → 10%, 5+ → 15%
//      (tính trên TỔNG rồi trừ một lần, làm tròn tới đồng).
//   3. Trừ mã giảm giá trên tạm tính sau giảm theo số lượng.
//   4. Phí ship: tạm tính sau cả hai lần giảm ≥ 1.000.000₫ → freeship,
//      dưới mức → 30.000₫. Tổng = tạm tính sau mã + phí ship.
// Hàm thuần (không đụng database) để test tự động khóa chặt công thức.

export function bulkPctForQty(totalQty: number): number {
  if (totalQty === 2) return 7;
  if (totalQty >= 3 && totalQty <= 4) return 10;
  if (totalQty >= 5) return 15;
  return 0;
}

export function discountAmountFor(kind: string, value: number, subtotalAfterBulk: number): number {
  if (subtotalAfterBulk <= 0) return 0;
  if (kind === "percent") return Math.round((subtotalAfterBulk * Math.min(100, Math.max(0, value))) / 100);
  return Math.min(Math.max(0, value), subtotalAfterBulk);
}

export interface OrderTotals {
  totalQuantity: number;
  subtotalBeforeBulk: number;
  bulkPct: number;
  bulkDiscountAmount: number;
  subtotal: number;
  discountAmount: number;
  subtotalAfterCoupon: number;
  shippingFee: number;
  total: number;
}

export function computeOrderTotals(
  lines: Array<{ unitPrice: number; quantity: number }>,
  coupon: { kind: string; value: number } | null,
): OrderTotals {
  const totalQuantity = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotalBeforeBulk = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const bulkPct = bulkPctForQty(totalQuantity);
  const bulkDiscountAmount = bulkPct > 0 ? Math.round((subtotalBeforeBulk * bulkPct) / 100) : 0;
  const subtotal = subtotalBeforeBulk - bulkDiscountAmount;
  const discountAmount = coupon ? discountAmountFor(coupon.kind, coupon.value, subtotal) : 0;
  const subtotalAfterCoupon = subtotal - discountAmount;
  const shippingFee = subtotalAfterCoupon >= 1000000 ? 0 : 30000;
  return {
    totalQuantity,
    subtotalBeforeBulk,
    bulkPct,
    bulkDiscountAmount,
    subtotal,
    discountAmount,
    subtotalAfterCoupon,
    shippingFee,
    total: subtotalAfterCoupon + shippingFee,
  };
}
