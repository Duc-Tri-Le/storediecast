// ── Giỏ hàng: khóa dòng + lưu trữ trên máy khách ───────────────────
// Giỏ chỉ sống trên máy của khách (localStorage). Mã giảm giá đã áp
// được lưu kèm (bản v2: định nghĩa mã do MÁY CHỦ xác nhận khi áp);
// bản lưu cũ dạng chữ trần (redshop-coupon) KHÔNG còn được tự hiểu
// thành mã nữa — đợt rà soát 30/10/2026 đã gỡ đường vòng
// legacyCouponFromCode hardcode GIAM10/GIAM50K: muốn áp mã thì nhập
// lại và máy chủ (validateDiscountCode) xác nhận, một đường duy nhất.
import type { AppliedCoupon } from "./pricing";

// Khóa giỏ hàng theo đúng biến thể màu: "<productId>:<variantId>".
// Giỏ cũ lưu theo productId trần ("<productId>") vẫn đọc được — hiểu là
// màu mặc định của mẫu đó.
export function cartKeyOf(productId: number, variantId: number | null): string {
  return variantId != null ? `${productId}:${variantId}` : `${productId}`;
}

export function loadCartMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem("redshop-cart");
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveCartMap(cart: Record<string, number>): void {
  try {
    localStorage.setItem("redshop-cart", JSON.stringify(cart));
  } catch {
    /* ignore */
  }
}

export function loadStoredCoupon(): AppliedCoupon | null {
  try {
    const rawV2 = localStorage.getItem("redshop-coupon-v2");
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as AppliedCoupon;
      if (parsed && typeof parsed.code === "string" && typeof parsed.value === "number") return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredCoupon(coupon: AppliedCoupon | null): void {
  try {
    if (coupon) localStorage.setItem("redshop-coupon-v2", JSON.stringify(coupon));
    else localStorage.removeItem("redshop-coupon-v2");
    localStorage.removeItem("redshop-coupon");
  } catch {
    /* ignore */
  }
}
