import type { Product, Variant } from "../types";

// ── Money formatting + pricing rules phía khách ─────────────────────
// Các hàm ở đây CHỈ để hiển thị và tạm tính cho khách xem; máy chủ
// luôn tính lại toàn bộ bằng server/src/pricing.ts khi đặt hàng.

export function fmt(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

// Một sản phẩm trên kệ là một MẪU XE; bên trong có nhiều biến thể màu,
// mỗi màu có ảnh/giá/khuyến mãi/tồn kho riêng. Biến thể đầu tiên là màu
// mặc định — thẻ kệ, giá và ảnh trên thẻ đều lấy từ màu mặc định này.
export function defaultVariant(p: Product): Variant | null {
  return p.variants[0] ?? null;
}

export function variantPrice(v: Variant): number {
  return v.promoPrice != null && v.promoPrice > 0 ? v.promoPrice : v.price;
}

// Mua nhiều giảm nhiều: mức giảm theo KHOẢNG TỔNG số lượng trong đơn
// — tổng 1 chiếc không giảm, tổng 2 chiếc giảm 7%, tổng 3–4 chiếc
// giảm 10%, tổng 5 chiếc trở lên giảm 15%. Cách tính (chủ shop chốt):
// tính TỔNG trước rồi mới trừ theo phần trăm — KHÔNG tính giảm theo
// từng chiếc rồi nhân số lượng. Bước 1: tổng trước giảm = tổng (giá
// phải trả của từng dòng × số lượng), gộp mọi mẫu, mọi màu; giá phải
// trả của một dòng là giá phải trả của biến thể màu đã chọn (giá
// khuyến mãi nếu có, không thì giá gốc). Bước 2: số tiền giảm =
// round(tổng trước giảm × phần trăm theo tổng số lượng), làm tròn tới
// đồng; tổng sau giảm = tổng trước giảm − số tiền giảm. Trang chi
// tiết vẫn dùng các thẻ mức dưới đây để chọn số lượng cho sản phẩm
// đang xem (khi đó tổng của đơn tạm tính là số lượng đang chọn), hộp
// thoại Mua ngay chỉ có 1 sản phẩm nên tổng của nó bằng số lượng
// trong hộp thoại, còn giỏ hàng / bước đặt hàng từ giỏ / máy chủ luôn
// tính lại theo tổng số lượng cả giỏ. Mức 2 sản phẩm là phổ biến nhất.
// minQty là số lượng tối thiểu của mức: bấm một mức ở trang chi tiết
// là đặt số lượng thành minQty của mức đó (2 → 2, 3–4 → 3, 5 trở lên
// → 5); mức bị khóa khi tồn kho của màu đang chọn nhỏ hơn minQty.
export const BULK_TIERS: Array<{
  minQty: number;
  maxQty: number | null;
  pct: number;
  popular: boolean;
  label: string;
}> = [
  { minQty: 2, maxQty: 2, pct: 7, popular: true, label: "2 sản phẩm" },
  { minQty: 3, maxQty: 4, pct: 10, popular: false, label: "3–4 sản phẩm" },
  { minQty: 5, maxQty: null, pct: 15, popular: false, label: "5 sản phẩm trở lên" },
];

export function bulkTierForQty(
  qty: number,
): (typeof BULK_TIERS)[number] | null {
  return (
    BULK_TIERS.find(
      (t) => qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty),
    ) ?? null
  );
}

export function bulkPctForQty(qty: number): number {
  return bulkTierForQty(qty)?.pct ?? 0;
}

// Giá mỗi sản phẩm SAU giảm theo khoảng số lượng — CHỈ dùng để HIỂN
// THỊ tham khảo giá mỗi chiếc ở trang chi tiết (thẻ mức, dòng trạng
// thái), KHÔNG dùng làm căn cứ tính tổng ở bất cứ đâu: mọi tổng tiền
// đều tính theo công thức tổng-trước-rồi-trừ-phần-trăm ở dưới.
export function bulkUnitPrice(basePrice: number, qty: number): number {
  const pct = bulkPctForQty(qty);
  return pct > 0 ? Math.round((basePrice * (100 - pct)) / 100) : basePrice;
}

// Mức giảm theo TỔNG số lượng của cả đơn (gộp mọi dòng).
export function orderBulkPct(totalQty: number): number {
  return bulkPctForQty(totalQty);
}

// Số tiền giảm theo số lượng của MỘT ĐƠN: tính trên TỔNG tiền trước
// giảm của cả đơn (không tính theo từng chiếc), làm tròn tới đồng.
// totalQty là tổng số lượng của cả đơn (gộp mọi mẫu, mọi màu); ở
// trang chi tiết / Mua ngay (đơn 1 sản phẩm) nó là số lượng của sản
// phẩm đó.
export function bulkDiscountForTotal(totalBefore: number, totalQty: number): number {
  const pct = bulkPctForQty(totalQty);
  return pct > 0 ? Math.round((totalBefore * pct) / 100) : 0;
}

// Tổng tiền SAU giảm theo số lượng = tổng trước giảm − số tiền giảm
// tính trên tổng (hàm ở trên). Đây là con số duy nhất dùng làm căn cứ
// tính mã giảm giá, phí ship và tổng thanh toán.
export function bulkSubtotalAfter(totalBefore: number, totalQty: number): number {
  return totalBefore - bulkDiscountForTotal(totalBefore, totalQty);
}

// ── Mã giảm giá ─────────────────────────────────────────────────────
// Áp cho toàn web ở đúng 3 nơi nhập: khối Tổng cộng trên trang Giỏ
// hàng, hộp thoại Mua ngay và bước đặt hàng từ giỏ. Mỗi đơn chỉ dùng
// đúng 1 mã, không cộng dồn. Mã nhập được chuẩn hoá: bỏ khoảng trắng
// thừa ở hai đầu và không phân biệt hoa thường. Hai mã dưới đây là mã
// MẪU để kiểm tra hệ thống — không phải mã thật của shop và không
// được liệt kê ra cho khách xem ở bất cứ đâu trên web.
// Cách tính (giống hệt máy chủ): tạm tính sau giảm theo tổng số lượng
// trước → trừ giảm giá mã trên tạm tính đó → mới tính phí ship;
// freeship xét trên tạm tính sau cả hai lần giảm.
export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase();
}

// Mã giảm giá nay do chủ shop quản trị trong hệ thống quản lý của shop (bảng
// discount_codes, cùng database với web khách): GIAM10 / GIAM50K chỉ
// là hai mã mẫu được nạp sẵn, chủ shop sửa / tắt / thêm mã ở hệ thống quản lý
// là khách áp mã thấy ngay. Phía khách KHÔNG tự đoán mã có hợp lệ hay
// không nữa — bấm Áp dụng là hỏi máy chủ (validateDiscountCode) và chỉ
// áp khi máy chủ xác nhận mã đang bật; định nghĩa mã đã áp (code +
// kind + value) được giữ trong state để tính lại số tiền giảm mỗi khi
// tạm tính thay đổi, đúng công thức của máy chủ.
export type AppliedCoupon = { code: string; kind: string; value: number };

export function couponDiscountAmount(coupon: AppliedCoupon | null, subtotalAfterBulk: number): number {
  if (!coupon || subtotalAfterBulk <= 0) return 0;
  if (coupon.kind === "percent") return Math.round((subtotalAfterBulk * Math.min(100, Math.max(0, coupon.value))) / 100);
  return Math.min(Math.max(0, coupon.value), subtotalAfterBulk);
}

// Giá khách phải trả của một mẫu = giá phải trả của màu mặc định.
export function effectivePrice(p: Product): number {
  const v = defaultVariant(p);
  return v ? variantPrice(v) : p.promoPrice != null && p.promoPrice > 0 ? p.promoPrice : p.price;
}

// Mẫu có đang giảm giá ở ÍT NHẤT một màu hay không (cho mục Đang giảm
// giá ở trang chủ và cột Giảm giá ở trang Sản phẩm).
export function anyVariantOnSale(p: Product): boolean {
  return p.variants.some((v) => v.promoPrice != null && v.promoPrice > 0);
}

// Biến thể dùng để HIỂN THỊ giá ở thẻ nhỏ cột Giảm giá: màu đang khuyến
// mãi đầu tiên nếu màu mặc định không khuyến mãi.
export function saleDisplayVariant(p: Product): Variant | null {
  return p.variants.find((v) => v.promoPrice != null && v.promoPrice > 0) ?? defaultVariant(p);
}
