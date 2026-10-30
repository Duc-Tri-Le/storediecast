import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import {
  AddressMapPicker,
  AddressSelectFields,
  useVietnamAddress,
  type MapAddressParts,
} from "../address";
import type { Product, Variant } from "../types";
import {
  bulkDiscountForTotal,
  bulkPctForQty,
  defaultVariant,
  effectivePrice,
  couponDiscountAmount,
  fmt,
  variantPrice,
  type AppliedCoupon,
} from "../services/pricing";
import { CouponField } from "./CouponField";
import { BuyNowPlacedView, type PlacedOrderInfo } from "./BuyNowPlacedView";
import { BuyNowProductSection } from "./BuyNowProductSection";

export function BuyNowDialog({
  product,
  initialVariantId,
  initialQty,
  onClose,
  onPlaced,
}: {
  product: Product;
  initialVariantId: number | null;
  initialQty: number;
  onClose: () => void;
  onPlaced: () => void;
}) {
  const [variantId, setVariantId] = useState<number | null>(() =>
    initialVariantId != null && product.variants.some((v) => v.id === initialVariantId)
      ? initialVariantId
      : (product.variants[0]?.id ?? null),
  );
  const variant =
    product.variants.find((v) => v.id === variantId) ?? defaultVariant(product);
  const stock = variant ? variant.stock : product.stock;
  const [qty, setQty] = useState(() =>
    Math.max(1, Math.min(initialQty, Math.max(1, stock))),
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const addr = useVietnamAddress();
  const city = addr.cityName;
  const district = addr.districtName;
  const ward = addr.wardName;
  const [street, setStreet] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleMapApply(parts: MapAddressParts) {
    void addr.applyMapAddress(parts).then((streetFromMap) => {
      if (streetFromMap) setStreet(streetFromMap);
    });
  }

  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const couponCode = coupon?.code ?? null;
  const [placed, setPlaced] = useState<PlacedOrderInfo | null>(null);

  const price = variant ? variantPrice(variant) : effectivePrice(product);
  const listPrice = variant ? variant.price : product.price;
  const promoPrice = variant ? variant.promoPrice : product.promoPrice;
  const colorName = variant ? variant.colorName : product.colorName;
  const out = stock <= 0;

  const bulkPct = bulkPctForQty(qty);
  const subtotalBefore = price * qty;
  const bulkDiscount = bulkDiscountForTotal(subtotalBefore, qty);
  const subtotal = subtotalBefore - bulkDiscount;
  const couponDiscount = couponDiscountAmount(coupon, subtotal);
  const subtotalAfterCoupon = subtotal - couponDiscount;
  const shippingFee = subtotalAfterCoupon >= 1000000 ? 0 : 30000;
  const total = subtotalAfterCoupon + shippingFee;
  const cleanName = product.name.replace(" [MẪU]", "");

  function pickVariant(v: Variant) {
    setVariantId(v.id);
    setQty((q) => Math.max(1, Math.min(q, Math.max(1, v.stock))));
  }

  const createOrder = useMutation({
    mutationFn: () =>
      api.createOrder({
        customerName: name,
        customerPhone: phone,
        customerAddress: [street, ward, district, city]
          .map((s) => s.trim())
          .filter(Boolean)
          .join(", "),
        note,
        paymentMethod: "transfer",
        discountCode: couponCode ?? undefined,
        items: [
          {
            productId: product.id,
            variantId: variant?.id ?? null,
            quantity: qty,
          },
        ],
      }),
    onSuccess: (res) => {
      if (res.ok && res.orderId != null) {
        setPlaced({
          id: res.orderId,
          total: res.total,
          subtotalBefore,
          bulkPct,
          bulkDiscount,
          subtotalAfterBulk: subtotal,
          code: couponCode,
          discount: couponDiscount,
          subtotalAfterCoupon,
          shippingFee,
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
    if (out) return setError(`Màu ${colorName} đang hết hàng — chọn màu khác còn hàng nhé.`);
    if (qty > stock) return setError(`Màu ${colorName} chỉ còn ${stock} chiếc.`);
    if (name.trim().length < 2) return setError("Vui lòng nhập họ và tên người mua.");
    if (phone.replace(/\D/g, "").length < 9)
      return setError("Số điện thoại chưa đúng — cần ít nhất 9 số để shop gọi xác nhận.");
    if (city.trim() === "")
      return setError(addr.manualMode ? "Vui lòng nhập Tỉnh/Thành phố." : "Vui lòng chọn Tỉnh/Thành phố.");
    if (district.trim() === "")
      return setError(addr.manualMode ? "Vui lòng nhập Quận/huyện." : "Vui lòng chọn Quận/huyện.");
    if (ward.trim() === "")
      return setError(addr.manualMode ? "Vui lòng nhập Xã/phường." : "Vui lòng chọn Xã/phường.");
    if (street.trim().length < 3) return setError("Vui lòng nhập Số nhà và tên đường.");
    createOrder.mutate();
  }

  const inputCls =
    "w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Đặt mua ${product.name}`}
    >
      <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-[var(--surface)] md:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[var(--dark)] px-5 py-4 text-white">
          <h3 className="min-w-0 truncate text-base font-black md:text-lg">
            Đặt mua {product.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại mua ngay"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-base font-black text-white transition hover:bg-white/30"
          >
            ✕
          </button>
        </div>

        {placed ? (
          <BuyNowPlacedView
            placed={placed}
            cleanName={cleanName}
            colorName={colorName}
            qty={qty}
            onClose={onClose}
          />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="grid gap-6 px-5 py-5 md:grid-cols-2">
              <BuyNowProductSection
                product={product}
                variant={variant}
                colorName={colorName}
                price={price}
                listPrice={listPrice}
                promoPrice={promoPrice}
                stock={stock}
                out={out}
                qty={qty}
                setQty={setQty}
                onPickVariant={pickVariant}
                bulkPct={bulkPct}
                bulkDiscount={bulkDiscount}
                subtotalBefore={subtotalBefore}
                subtotal={subtotal}
              />

              <section aria-label="Thông tin người mua" className="min-w-0">
                <h4 className="font-bold">Thông tin người mua</h4>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="bn-name" className="sr-only">Họ và tên</label>
                    <input
                      id="bn-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Họ và tên *"
                      autoComplete="name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="bn-phone" className="sr-only">Số điện thoại</label>
                    <input
                      id="bn-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Số điện thoại *"
                      inputMode="tel"
                      autoComplete="tel"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <AddressMapPicker idPrefix="bn" onApply={handleMapApply} />
                </div>
                <div className="mt-2">
                  <AddressSelectFields addr={addr} idPrefix="bn" inputCls={inputCls} />
                </div>
                <div className="mt-2">
                  <label htmlFor="bn-street" className="sr-only">Số nhà, tên đường</label>
                  <input
                    id="bn-street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Số nhà, tên đường *"
                    autoComplete="street-address"
                    className={inputCls}
                  />
                </div>
                <div className="mt-2">
                  <label htmlFor="bn-note" className="sr-only">Ghi chú đơn hàng (không bắt buộc)</label>
                  <textarea
                    id="bn-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú đơn hàng (Không bắt buộc)"
                    rows={2}
                    className={inputCls}
                  />
                </div>

                <h4 className="mt-5 font-bold">Vận chuyển</h4>
                <p className="mt-2 rounded-xl bg-[var(--surface2)] px-3.5 py-2.5 text-sm leading-relaxed">
                  {shippingFee === 0 ? (
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

                <h4 className="mt-5 font-bold">Hình thức thanh toán</h4>
                <div
                  className="mt-2 rounded-xl border border-[var(--accent)] bg-[var(--surface2)] p-3 text-sm font-bold"
                  aria-label="Hình thức thanh toán: Chuyển khoản (đã chọn)"
                >
                  <span aria-hidden className="mr-2 text-[var(--accent)]">✓</span>
                  Chuyển khoản
                </div>

                <div className="mt-5 [&>div>label]:text-base [&>div>label]:font-bold">
                  <CouponField
                    idPrefix="buynow"
                    appliedCode={couponCode}
                    discountAmount={couponDiscount}
                    subtotalAfterBulk={subtotal}
                    onApply={setCoupon}
                    onRemove={() => setCoupon(null)}
                  />
                </div>

                <div className="mt-5 space-y-1.5 rounded-2xl bg-[var(--surface2)] p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--dim)]">
                      Tạm tính ({qty} × {fmt(price)})
                    </span>
                    <span className="font-semibold tabular-nums">{fmt(subtotalBefore)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[var(--dim)]">Giảm theo số lượng ({bulkPct}%)</span>
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
                      {shippingFee === 0 ? "Miễn phí" : fmt(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-[var(--border)] pt-2 text-base">
                    <span className="font-bold">Tổng tiền</span>
                    <span className="font-black tabular-nums text-[var(--accent)]">{fmt(total)}</span>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-200">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={createOrder.isPending || out}
                  aria-label={`Đặt hàng ngay ${qty} chiếc ${product.name} màu ${colorName}, tổng ${fmt(total)}`}
                  className="mt-4 w-full rounded-full bg-[var(--accent)] py-4 text-base font-black uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createOrder.isPending ? "Đang gửi đơn…" : "Đặt hàng ngay"}
                </button>
              </section>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
