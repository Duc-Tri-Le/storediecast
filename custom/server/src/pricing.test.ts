import { describe, expect, test } from "bun:test";
import { bulkPctForQty, computeOrderTotals, discountAmountFor } from "./pricing";
import { isValidPhone, normalizePhone, PHONE_MIN_DIGITS } from "./phone";

describe("bulkPctForQty — giảm theo TỔNG số lượng", () => {
  test("1 chiếc không giảm, 2 giảm 7%, 3–4 giảm 10%, 5+ giảm 15%", () => {
    expect(bulkPctForQty(1)).toBe(0);
    expect(bulkPctForQty(2)).toBe(7);
    expect(bulkPctForQty(3)).toBe(10);
    expect(bulkPctForQty(4)).toBe(10);
    expect(bulkPctForQty(5)).toBe(15);
    expect(bulkPctForQty(12)).toBe(15);
  });
});

describe("computeOrderTotals — tổng trước → trừ % → trừ mã → ship/freeship", () => {
  test("không giảm, dưới 1 triệu: cộng phí ship 30.000₫", () => {
    const t = computeOrderTotals([{ unitPrice: 119000, quantity: 1 }], null);
    expect(t.subtotalBeforeBulk).toBe(119000);
    expect(t.bulkDiscountAmount).toBe(0);
    expect(t.subtotalAfterCoupon).toBe(119000);
    expect(t.shippingFee).toBe(30000);
    expect(t.total).toBe(149000);
  });

  test("2 chiếc: giảm 7% trên TỔNG (không phải từng chiếc)", () => {
    const t = computeOrderTotals([{ unitPrice: 100001, quantity: 2 }], null);
    // round(200002 * 7%) = 14000 — tính theo từng chiếc sẽ ra số khác.
    expect(t.subtotalBeforeBulk).toBe(200002);
    expect(t.bulkDiscountAmount).toBe(14000);
    expect(t.subtotal).toBe(186002);
    expect(t.total).toBe(186002 + 30000);
  });

  test("mã phần trăm trừ SAU giảm theo số lượng", () => {
    const t = computeOrderTotals([{ unitPrice: 500000, quantity: 2 }], { kind: "percent", value: 10 });
    expect(t.subtotal).toBe(930000); // 1.000.000 − 7%
    expect(t.discountAmount).toBe(93000);
    expect(t.subtotalAfterCoupon).toBe(837000);
    expect(t.shippingFee).toBe(30000);
    expect(t.total).toBe(867000);
  });

  test("freeship xét SAU cả hai lần giảm: 1.000.000₫ sau mã mới freeship", () => {
    const free = computeOrderTotals([{ unitPrice: 1000000, quantity: 1 }], null);
    expect(free.shippingFee).toBe(0);
    const notFree = computeOrderTotals([{ unitPrice: 1000000, quantity: 1 }], { kind: "fixed", value: 50000 });
    expect(notFree.subtotalAfterCoupon).toBe(950000);
    expect(notFree.shippingFee).toBe(30000);
  });

  test("mã cố định không trừ quá tạm tính", () => {
    expect(discountAmountFor("fixed", 50000, 30000)).toBe(30000);
    expect(discountAmountFor("percent", 10, 0)).toBe(0);
  });

  test("dòng trùng biến thể đã gộp: tổng lượng gộp quyết định mức giảm", () => {
    // Hai dòng cùng màu 1 + 1 chiếc được server gộp thành 2 → giảm 7%.
    const t = computeOrderTotals(
      [
        { unitPrice: 200000, quantity: 1 },
        { unitPrice: 200000, quantity: 1 },
      ],
      null,
    );
    expect(t.totalQuantity).toBe(2);
    expect(t.bulkPct).toBe(7);
  });
});

describe("normalizePhone — một quy tắc cho tạo / tra cứu / hủy", () => {
  test("bỏ ký tự không phải số và chuẩn hoá đầu 84 → 0", () => {
    expect(normalizePhone("090 123 4567")).toBe("0901234567");
    expect(normalizePhone("+84 901 234 567")).toBe("0901234567");
    expect(normalizePhone("0901234567")).toBe("0901234567");
  });
  test("ngưỡng tối thiểu thống nhất", () => {
    expect(isValidPhone(normalizePhone("09012345"))).toBe(false); // 8 số: từ chối ở cả 3 nơi
    expect(isValidPhone(normalizePhone("090123456"))).toBe(true);
    expect(PHONE_MIN_DIGITS).toBe(9);
  });
});
