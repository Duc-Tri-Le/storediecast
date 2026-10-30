import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import {
  AddressMapPicker,
  AddressSelectFields,
  useVietnamAddress,
  type MapAddressParts,
} from "../address";
import type { CartLine } from "../types";
import {
  effectivePrice,
  fmt,
  orderBulkPct,
  variantPrice,
  type AppliedCoupon,
} from "../services/pricing";
import { resolveProductImage } from "../data/maps";
import { CouponField } from "./CouponField";

export function CheckoutPage({
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
  onBackToCart,
  onShop,
  onPlaced,
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
  onBackToCart: () => void;
  onShop: () => void;
  onPlaced: () => void;
}) {
  const derivedTotalQty = items.reduce((s, i) => s + i.qty, 0);
  const effectiveTotalQty = derivedTotalQty > 0 ? derivedTotalQty : totalQty;
  const effectiveBulkPct = orderBulkPct(effectiveTotalQty) || bulkPct;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const addr = useVietnamAddress();
  const [street, setStreet] = useState("");
  const address = [street, addr.wardName, addr.districtName, addr.cityName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
  function handleMapApply(parts: MapAddressParts) {
    void addr.applyMapAddress(parts).then((streetFromMap) => {
      if (streetFromMap) setStreet(streetFromMap);
    });
  }
  const [note, setNote] = useState("");
  const pay = "transfer" as const;
  const [error, setError] = useState<string | null>(null);

  const [placed, setPlaced] = useState<{
    id: number;
    total: number;
    subtotalBefore: number;
    bulkPct: number;
    bulkDiscount: number;
    subtotalAfterBulk: number;
    code: string | null;
    discount: number;
    subtotalAfterCoupon: number;
    shippingFee: number;
  } | null>(null);
  const total = subtotalAfterCoupon + shipping;

  const createOrder = useMutation({
    mutationFn: () =>
      api.createOrder({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        note,
        paymentMethod: pay,
        discountCode: couponCode ?? undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          variantId: i.variant?.id ?? null,
          quantity: i.qty,
        })),
      }),
    onSuccess: (res) => {
      if (res.ok && res.orderId != null) {
        setPlaced({
          id: res.orderId,
          total: res.total,
          subtotalBefore,
          bulkPct: effectiveBulkPct,
          bulkDiscount,
          subtotalAfterBulk: subtotal,
          code: couponCode,
          discount: couponDiscount,
          subtotalAfterCoupon,
          shippingFee: shipping,
        });
        onPlaced();
      } else {
        setError(res.error ?? "Không đặt được đơn, vui lòng thử lại.");
      }
    },
    onError: () => setError("Không gửi được đơn. Kiểm tra lại thông tin và thử lại."),
  });

  function submit() {
    setError(null);
    if (items.length === 0) return setError("Giỏ đang trống.");
    if (name.trim().length < 2) return setError("Vui lòng nhập họ tên người nhận.");
    if (phone.replace(/\D/g, "").length < 9)
      return setError("Số điện thoại chưa đúng — cần ít nhất 9 số để shop gọi xác nhận.");
    if (addr.cityName.trim() === "")
      return setError(addr.manualMode ? "Vui lòng nhập Tỉnh/Thành phố." : "Vui lòng chọn Tỉnh/Thành phố.");
    if (addr.districtName.trim() === "")
      return setError(addr.manualMode ? "Vui lòng nhập Quận/huyện." : "Vui lòng chọn Quận/huyện.");
    if (addr.wardName.trim() === "")
      return setError(addr.manualMode ? "Vui lòng nhập Xã/phường." : "Vui lòng chọn Xã/phường.");
    if (street.trim().length < 3) return setError("Vui lòng nhập Số nhà, tên đường.");
    createOrder.mutate();
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-sm outline-none focus:border-[var(--accent)]";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <h1 className="text-3xl font-black tracking-tight">Đặt hàng</h1>

      {placed ? (
        <div className="mt-8 max-w-xl">
          <div className="rounded-2xl bg-[var(--surface)] p-6 text-center border border-[var(--border)]">
            <p className="text-4xl" aria-hidden>✓</p>
            <h2 className="mt-2 text-lg font-black">Đặt hàng thành công</h2>
            <p className="mt-1 font-bold">Đơn #{placed.id} đã được ghi nhận</p>
            <p className="mt-1 text-sm text-[var(--dim)]">
              Tạm tính: {fmt(placed.subtotalBefore)}
              {placed.bulkPct > 0
                ? ` — giảm theo số lượng ${placed.bulkPct}%: −${fmt(placed.bulkDiscount)}, tạm tính sau giảm theo số lượng ${fmt(placed.subtotalAfterBulk)}`
                : ""}
              {placed.code
                ? ` — giảm giá mã ${placed.code}: −${fmt(placed.discount)}, tạm tính sau mã ${fmt(placed.subtotalAfterCoupon)}`
                : ""}
              {`, phí ship ${placed.shippingFee === 0 ? "Miễn phí" : fmt(placed.shippingFee)}.`}
            </p>
            <p className="mt-1 text-sm text-[var(--dim)]">
              Tổng thanh toán:{" "}
              <span className="font-bold text-[var(--text)]">{fmt(placed.total)}</span>
              {" — thanh toán bằng chuyển khoản."}
            </p>
            <p className="mt-2 text-sm text-[var(--dim)]">
              Tra cứu đơn bằng đúng số điện thoại vừa đặt ở mục “Tra cứu đơn hàng”.
            </p>
          </div>
          <button
            type="button"
            onClick={onShop}
            className="mt-4 w-full rounded-full bg-[var(--accent)] py-3.5 font-bold text-white"
          >
            Tiếp tục xem mô hình
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <p className="text-lg font-bold">Giỏ hàng của bạn đang trống.</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-[var(--dim)]">
            Chưa có gì để thanh toán. Sang trang Sản phẩm để chọn mẫu bạn thích nhé.
          </p>
          <button
            type="button"
            onClick={onShop}
            aria-label="Tiếp tục xem sản phẩm ở trang Sản phẩm"
            className="mt-5 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white"
          >
            Tiếp tục xem sản phẩm
          </button>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form
            className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <h2 className="font-black">Thông tin người mua</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="co-name" className="text-sm font-semibold">Họ tên người nhận *</label>
                <input id="co-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Nguyễn Văn A" autoComplete="name" className={inputCls} />
              </div>
              <div>
                <label htmlFor="co-phone" className="text-sm font-semibold">Số điện thoại *</label>
                <input id="co-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" inputMode="tel" autoComplete="tel" className={inputCls} />
              </div>
              <div>
                <span className="text-sm font-semibold">Địa chỉ nhận hàng *</span>
                <div className="mt-2">
                  <AddressMapPicker idPrefix="co" onApply={handleMapApply} />
                </div>
                <div className="mt-2 [&_input]:mt-0 [&_select]:mt-0">
                  <AddressSelectFields
                    addr={addr}
                    idPrefix="co"
                    inputCls="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="mt-2">
                  <label htmlFor="co-street" className="sr-only">Số nhà, tên đường</label>
                  <input id="co-street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Số nhà, tên đường *" autoComplete="street-address" className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
                </div>
              </div>
              <div>
                <label htmlFor="co-note" className="text-sm font-semibold">Ghi chú cho shop</label>
                <input id="co-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Giờ giao, yêu cầu gói quà…" className={inputCls} />
              </div>
            </div>

            <div className="mt-6">
              <h2 className="font-black">Vận chuyển</h2>
              <p className="mt-2 rounded-xl bg-[var(--surface2)] px-3.5 py-2.5 text-sm leading-relaxed">
                {shipping === 0 ? (
                  <>
                    <strong>Miễn phí vận chuyển</strong> — đơn này đạt mức freeship từ{" "}
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

            <div className="mt-6">
              <h2 className="font-black">Cách thanh toán</h2>
              <div
                className="mt-2 rounded-xl border border-[var(--accent)] bg-[var(--surface2)] p-3 text-sm font-bold"
                aria-label="Phương thức thanh toán: Chuyển khoản (đã chọn)"
              >
                <span aria-hidden className="mr-2 text-[var(--accent)]">✓</span>
                Chuyển khoản
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={createOrder.isPending}
              aria-label={`Đặt hàng, tổng ${fmt(total)}`}
              className="mt-5 w-full rounded-full bg-[var(--accent)] py-4 text-base font-black text-white disabled:opacity-60"
            >
              {createOrder.isPending ? "Đang gửi đơn…" : `Đặt hàng · ${fmt(total)}`}
            </button>
            <p className="mt-3 text-center text-xs text-[var(--dim)]">
              Đặt hàng xong, số lượng trong kho sẽ trừ tương ứng. Hủy đơn ở trang Tra cứu đơn hàng sẽ cộng lại kho.
            </p>
            <button
              type="button"
              onClick={onBackToCart}
              aria-label="Quay lại trang Giỏ hàng"
              className="mt-3 w-full rounded-full border border-[var(--border)] py-3 text-sm font-bold"
            >
              ← Quay lại giỏ hàng
            </button>
          </form>

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
        </div>
      )}
    </main>
  );
}

