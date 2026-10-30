import { describe, expect, test } from "bun:test";
import {
  bulkDiscountForTotal,
  bulkPctForQty,
  bulkSubtotalAfter,
  couponDiscountAmount,
  normalizeCouponCode,
} from "./pricing";

// Khóa công thức hiển thị phía khách khớp với server (server luôn là
// nơi tính lại khi đặt hàng): tổng trước → trừ % theo tổng số lượng →
// trừ mã → ship/freeship xét sau cả hai lần giảm.
describe("pricing phía khách khớp công thức server", () => {
  test("mức giảm theo tổng số lượng", () => {
    expect(bulkPctForQty(1)).toBe(0);
    expect(bulkPctForQty(2)).toBe(7);
    expect(bulkPctForQty(4)).toBe(10);
    expect(bulkPctForQty(5)).toBe(15);
  });
  test("giảm tính trên TỔNG, làm tròn tới đồng", () => {
    expect(bulkDiscountForTotal(200002, 2)).toBe(14000);
    expect(bulkSubtotalAfter(200002, 2)).toBe(186002);
  });
  test("mã trừ trên tạm tính sau giảm số lượng", () => {
    expect(couponDiscountAmount({ code: "GIAM10", kind: "percent", value: 10 }, 930000)).toBe(93000);
    expect(couponDiscountAmount({ code: "GIAM50K", kind: "fixed", value: 50000 }, 30000)).toBe(30000);
    expect(couponDiscountAmount(null, 930000)).toBe(0);
  });
  test("chuẩn hoá mã: bỏ khoảng trắng, không phân biệt hoa thường", () => {
    expect(normalizeCouponCode("  giam10 ")).toBe("GIAM10");
  });
});
