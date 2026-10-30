import {
  BULK_TIERS,
  bulkDiscountForTotal,
  bulkPctForQty,
  bulkSubtotalAfter,
  bulkTierForQty,
  bulkUnitPrice,
  fmt,
} from "../services/pricing";

export function ProductBulkDiscountSection({
  price,
  qty,
  stock,
  colorName,
  onSelectQty,
}: {
  price: number;
  qty: number;
  stock: number;
  colorName: string;
  onSelectQty: (q: number) => void;
}) {
  const bulkPct = bulkPctForQty(qty);
  const bulkTier = bulkTierForQty(qty);
  const bulkDiscount = bulkDiscountForTotal(price * qty, qty);
  const bulkTotal = bulkSubtotalAfter(price * qty, qty);

  return (
    <section aria-label="Mua nhiều giảm nhiều" className="mt-10">
      <h2 className="text-xl font-black tracking-tight">Mua nhiều giảm nhiều</h2>
      <p className="mt-1 text-sm text-[var(--dim)]">
        Giảm tính trên giá phải trả hiện tại của màu {colorName}. Chọn một mức để đặt số lượng
        tương ứng — Mua ngay ở phía trên dùng đúng giá sau giảm này; khi thêm vào giỏ, mức giảm
        sẽ được tính lại theo tổng số lượng của cả giỏ.
      </p>
      <div className="mt-4 space-y-3" role="group" aria-label="Chọn mức mua nhiều giảm nhiều">
        {BULK_TIERS.map((tier) => {
          const locked = stock < tier.minQty;
          const tierUnit = bulkUnitPrice(price, tier.minQty);
          const tierTotal = bulkSubtotalAfter(price * tier.minQty, tier.minQty);
          const selected = bulkTier?.minQty === tier.minQty && !locked;
          return (
            <button
              key={tier.minQty}
              type="button"
              disabled={locked}
              onClick={() => onSelectQty(tier.minQty)}
              aria-pressed={selected}
              aria-label={
                locked
                  ? `Mức mua ${tier.label} giảm ${tier.pct}% — không đủ hàng, màu ${colorName} chỉ còn ${stock} chiếc`
                  : `Chọn mức mua ${tier.label}, giảm ${tier.pct}% mỗi sản phẩm, tổng ${fmt(tierTotal)}`
              }
              className={`relative flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
                selected
                  ? "border-[var(--accent)] bg-[var(--surface)]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              } ${locked ? "cursor-not-allowed opacity-60" : "hover:border-[var(--accent)]"}`}
            >
              <span
                aria-hidden
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                  selected ? "border-[var(--accent)]" : "border-[var(--border)]"
                }`}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-black">{tier.label}</span>
                  <span className="rounded-md bg-[var(--surface2)] px-1.5 py-0.5 text-[11px] font-black text-[var(--accent)]">
                    Giảm {tier.pct}%
                  </span>
                  {tier.popular && (
                    <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] font-bold text-white">
                      Phổ biến nhất
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--dim)]">
                  {locked
                    ? `Chỉ còn ${stock} chiếc màu này — không đủ mức ${tier.label}`
                    : `giảm ${tier.pct}% tính trên tổng ${fmt(price * tier.minQty)} · khoảng ${fmt(tierUnit)}/chiếc sau giảm`}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-lg font-black tabular-nums text-[var(--accent)]">
                  {fmt(tierTotal)}
                </span>
                <span className="block text-xs tabular-nums text-[var(--dim)] line-through">
                  {fmt(price * tier.minQty)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {bulkPct > 0 ? (
        <p role="status" className="mt-3 text-sm font-semibold">
          Đang chọn mức {bulkTier?.label ?? `${qty} sản phẩm`} (−{bulkPct}% trên tổng{" "}
          <span className="tabular-nums">{fmt(price * qty)}</span>, giảm{" "}
          <span className="tabular-nums">{fmt(bulkDiscount)}</span>): tổng{" "}
          <span className="tabular-nums text-[var(--accent)]">{fmt(bulkTotal)}</span>{" "}
          <span className="tabular-nums text-[var(--dim)] line-through">{fmt(price * qty)}</span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-[var(--dim)]">
          Đang chọn {qty} sản phẩm — chưa khớp mức giảm nào. Chọn mức 2, 3–4 hoặc 5 sản phẩm trở lên ở trên
          để được giảm giá.
        </p>
      )}
    </section>
  );
}

