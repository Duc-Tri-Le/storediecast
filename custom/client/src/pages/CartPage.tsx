import type { CartLine, Product } from "../types";
import {
  effectivePrice,
  fmt,
  orderBulkPct,
  variantPrice,
  type AppliedCoupon,
} from "../services/pricing";
import { resolveProductImage } from "../data/maps";
import { CouponField } from "../components/CouponField";

export function CartPage({
  items,
  subtotalBefore,
  bulkDiscount,
  subtotal,
  shipping,
  totalQty,
  bulkPct,
  couponCode,
  couponDiscount,
  subtotalAfterCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onSetQty,
  onContinueShopping,
  onCheckout,
  onDetail,
}: {
  items: CartLine[];
  subtotalBefore: number;
  bulkDiscount: number;
  subtotal: number;
  shipping: number;
  totalQty: number;
  bulkPct: number;
  couponCode: string | null;
  couponDiscount: number;
  subtotalAfterCoupon: number;
  onApplyCoupon: (coupon: AppliedCoupon) => void;
  onRemoveCoupon: () => void;
  onSetQty: (key: string, qty: number, stock: number) => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
  onDetail: (p: Product) => void;
}) {
  const total = subtotalAfterCoupon + shipping;
  // Phòng khi props lệch: tự suy lại từ các dòng cho khớp hiển thị.
  const derivedTotalQty = items.reduce((s, i) => s + i.qty, 0);
  const effectiveTotalQty = derivedTotalQty > 0 ? derivedTotalQty : totalQty;
  const effectiveBulkPct = orderBulkPct(effectiveTotalQty);
  const displayBulkPct = effectiveBulkPct || bulkPct;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <h1 className="text-3xl font-black uppercase tracking-tight">Giỏ hàng</h1>
      {items.length > 0 && (
        <p role="status" className="mt-3 rounded-xl bg-[var(--surface)] px-4 py-3 text-sm font-semibold border border-[var(--border)]">
          {displayBulkPct > 0 ? (
            <>
              Tổng số lượng: {effectiveTotalQty} chiếc — giảm {displayBulkPct}% trên tổng tạm tính của cả đơn
            </>
          ) : (
            <>
              Tổng số lượng: {effectiveTotalQty} chiếc — chưa giảm theo tổng đơn (từ 2 chiếc trong đơn sẽ giảm 7% trên tổng tạm tính)
            </>
          )}
        </p>
      )}

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <p className="text-lg font-bold">Giỏ hàng của bạn đang trống.</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-[var(--dim)]">
            Chưa có mẫu mô hình nào trong giỏ. Sang trang Sản phẩm để chọn mẫu bạn thích nhé.
          </p>
          <button
            type="button"
            onClick={onContinueShopping}
            aria-label="Tiếp tục xem sản phẩm ở trang Sản phẩm"
            className="mt-5 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white"
          >
            Tiếp tục xem sản phẩm
          </button>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── Bên trái: bảng các dòng hàng ─────────────────────── */}
          <section aria-label="Các sản phẩm trong giỏ hàng" className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full border-collapse text-sm">
                <thead className="hidden md:table-header-group">
                  <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase tracking-wide text-[var(--accent)]">
                    <th scope="col" className="w-12 px-3 py-3.5">
                      <span className="sr-only">Xóa</span>
                    </th>
                    <th scope="col" className="px-3 py-3.5">Sản phẩm</th>
                    <th scope="col" className="w-32 px-3 py-3.5">Giá</th>
                    <th scope="col" className="w-36 px-3 py-3.5">Số lượng</th>
                    <th scope="col" className="w-32 px-3 py-3.5 text-right">Tạm tính</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(({ product: p, variant: v, qty, key }) => {
                    const lineStock = v ? v.stock : p.stock;
                    const lineColor = v ? v.colorName : p.colorName;
                    const lineListPrice = v ? v.price : p.price;
                    const linePromo = v ? v.promoPrice : p.promoPrice;
                    const lineBasePrice = v ? variantPrice(v) : effectivePrice(p);
                    // Giá từng dòng là giá phải trả CHƯA giảm theo số
                    // lượng: tổng các dòng (giá × số lượng) khớp đúng
                    // dòng Tạm tính, phần giảm theo số lượng chỉ trừ
                    // MỘT lần trên tổng ở khối Tổng cộng.
                    const lineUnit = lineBasePrice;
                    const lineTotal = lineUnit * qty;
                    return (
                      <tr
                        key={key}
                        className="block border-b border-[var(--border)] last:border-b-0 md:table-row"
                      >
                        <td className="block px-3 pt-3 md:table-cell md:py-4 md:align-top">
                          <button
                            type="button"
                            onClick={() => onSetQty(key, 0, lineStock)}
                            aria-label={`Xóa ${p.name} màu ${lineColor} khỏi giỏ hàng`}
                            className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface2)] text-sm font-black text-[var(--dim)] transition hover:text-[var(--accent)]"
                          >
                            ✕
                          </button>
                        </td>
                        <td className="block px-3 pb-2 md:table-cell md:py-4 md:align-top">
                          <div className="flex min-w-0 gap-3">
                            <button
                              type="button"
                              onClick={() => onDetail(p)}
                              aria-label={`Xem chi tiết ${p.name}`}
                              className="shrink-0"
                            >
                              <img
                                src={resolveProductImage(v ? v.imageKey : p.imageKey)}
                                alt={`Mô hình ${p.name} màu ${lineColor} tỉ lệ ${p.scale}`}
                                className="h-16 w-20 rounded-xl object-cover"
                              />
                            </button>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => onDetail(p)}
                                className="text-left font-bold leading-snug hover:underline"
                              >
                                {p.name}
                              </button>
                              <p className="mt-0.5 text-xs leading-relaxed text-[var(--dim)]">
                                {p.brand} · {p.vehicleType} · Tỉ lệ {p.scale}
                              </p>
                              <p className="text-xs leading-relaxed text-[var(--dim)]">
                                Màu: <span className="font-semibold text-[var(--text)]">{lineColor}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="block px-3 pb-2 md:table-cell md:py-4 md:align-top">
                          <span className="mr-2 text-xs font-bold uppercase text-[var(--dim)] md:hidden">
                            Giá
                          </span>
                          <span className="font-black tabular-nums text-[var(--accent)]">
                            {fmt(lineUnit)}
                          </span>
                          {linePromo != null && linePromo > 0 ? (
                            <span className="ml-2 tabular-nums text-[var(--dim)] line-through">
                              {fmt(lineListPrice)}
                            </span>
                          ) : null}
                        </td>
                        <td className="block px-3 pb-2 md:table-cell md:py-4 md:align-top">
                          <span className="mr-2 text-xs font-bold uppercase text-[var(--dim)] md:hidden">
                            Số lượng
                          </span>
                          <span className="inline-flex items-center rounded-full border border-[var(--border)]">
                            <button
                              type="button"
                              aria-label={`Giảm số lượng ${p.name} màu ${lineColor}`}
                              onClick={() => onSetQty(key, qty - 1, lineStock)}
                              className="flex min-h-[44px] items-center px-3.5 py-2 text-base font-bold"
                            >
                              −
                            </button>
                            <span
                              className="min-w-7 text-center font-bold tabular-nums"
                              aria-label={`Số lượng ${qty} của ${p.name} màu ${lineColor}`}
                            >
                              {qty}
                            </span>
                            <button
                              type="button"
                              aria-label={`Tăng số lượng ${p.name} màu ${lineColor}`}
                              disabled={qty >= lineStock}
                              onClick={() => onSetQty(key, qty + 1, lineStock)}
                              className="flex min-h-[44px] items-center px-3.5 py-2 text-base font-bold disabled:opacity-40"
                            >
                              +
                            </button>
                          </span>
                          <span className="mt-1 block text-xs text-[var(--dim)]">
                            Còn {lineStock} chiếc màu này
                          </span>
                        </td>
                        <td className="block px-3 pb-4 md:table-cell md:py-4 md:text-right md:align-top">
                          <span className="mr-2 text-xs font-bold uppercase text-[var(--dim)] md:hidden">
                            Tạm tính
                          </span>
                          <span className="font-black tabular-nums">{fmt(lineTotal)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={onContinueShopping}
              aria-label="Tiếp tục xem sản phẩm ở trang Sản phẩm"
              className="mt-5 rounded-full border-2 border-[var(--accent)] px-5 py-3 text-sm font-black uppercase tracking-wide text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white"
            >
              ← Tiếp tục xem sản phẩm
            </button>
          </section>

          {/* ── Bên phải: Tổng cộng giỏ hàng ─────────────────────── */}
          <section
            aria-label="Tổng cộng giỏ hàng"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <h2 className="text-base font-black uppercase tracking-wide text-[var(--accent)]">
              Tổng cộng giỏ hàng
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bold uppercase">Tổng số lượng</span>
                <span className="font-semibold tabular-nums">{effectiveTotalQty} chiếc</span>
              </div>
              {displayBulkPct > 0 && (
                <p className="text-xs font-semibold text-[var(--promo)]">
                  Đang áp giảm {displayBulkPct}% tính trên tổng tạm tính theo tổng số lượng trong đơn.
                </p>
              )}
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bold uppercase">Tạm tính</span>
                <span className="font-semibold tabular-nums">{fmt(subtotalBefore)}</span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bold uppercase">Giảm theo số lượng ({displayBulkPct}%)</span>
                <span className="font-semibold tabular-nums text-[var(--accent)]">
                  −{fmt(bulkDiscount)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bold uppercase">Tạm tính sau giảm theo số lượng</span>
                <span className="font-semibold tabular-nums">{fmt(subtotal)}</span>
              </div>
              <p className="text-xs text-[var(--dim)]">
                Giảm theo số lượng tính trên tổng tạm tính của cả đơn rồi trừ một lần, chưa gồm mã
                giảm giá và phí ship.
              </p>
              <div className="border-t border-[var(--border)] pt-3">
                <CouponField
                  idPrefix="cart"
                  appliedCode={couponCode}
                  discountAmount={couponDiscount}
                  subtotalAfterBulk={subtotal}
                  onApply={onApplyCoupon}
                  onRemove={onRemoveCoupon}
                />
              </div>
              {couponCode && (
                <>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-bold uppercase">Giảm giá mã {couponCode}</span>
                    <span className="font-semibold tabular-nums text-[var(--accent)]">
                      −{fmt(couponDiscount)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-bold uppercase">Tạm tính sau mã</span>
                    <span className="font-semibold tabular-nums">{fmt(subtotalAfterCoupon)}</span>
                  </div>
                </>
              )}
              <div className="border-t border-[var(--border)] pt-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-bold uppercase">Vận chuyển</span>
                  <span className="font-semibold tabular-nums">
                    {shipping === 0 ? "Miễn phí" : fmt(shipping)}
                  </span>
                </div>
                <p className="mt-2 rounded-xl bg-[var(--surface2)] px-3.5 py-2.5 leading-relaxed">
                  {shipping === 0 ? (
                    <>
                      <strong>Miễn phí vận chuyển</strong> – đơn này đạt mức freeship từ{" "}
                      1.000.000₫.
                    </>
                  ) : (
                    <>
                      <strong>Phí vận chuyển: 30.000₫</strong> — đơn từ 1.000.000₫ được miễn
                      phí vận chuyển (đơn này còn thiếu {fmt(1000000 - subtotalAfterCoupon)} để được
                      freeship).
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-3 text-base">
                <span className="font-black uppercase">Tổng</span>
                <span className="font-black tabular-nums text-[var(--accent)]">{fmt(total)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              aria-label={`Tiến hành thanh toán, tổng ${fmt(total)}`}
              className="mt-5 w-full rounded-full bg-[var(--accent)] py-4 text-base font-black uppercase tracking-wide text-white"
            >
              Tiến hành thanh toán
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

// =====================================================================
// BƯỚC ĐẶT HÀNG — sang từ nút "Tiến hành thanh toán" ở trang Giỏ hàng.
// Hiện các dòng trong giỏ (đúng màu, đúng số lượng), form thông tin
// người mua, mục Vận chuyển luôn hiện rõ cùng quy tắc freeship /
// 30.000₫ (xét trên tạm tính sau mã giảm giá) như trang Giỏ hàng, và
// Cách thanh toán chỉ có đúng 1 lựa chọn Chuyển khoản đã chọn sẵn.
// Mã giảm giá đã áp ở trang Giỏ hàng được GIỮ NGUYÊN sang đây (cùng
// state ở App) và đổi hoặc gỡ được ngay trong tóm tắt đơn ở bước này.
// Đặt hàng qua cùng action createOrder (kèm mã): máy chủ tự tính lại
// giảm theo tổng số lượng → giảm mã → phí ship, trừ tồn kho đúng màu
// đã chọn; hủy đơn "Mới" ở Tra cứu đơn hàng cộng lại kho. Đặt xong giỏ
// và mã của giỏ được xóa như trước.
// =====================================================================
