import type { Product, Variant } from "../types";
import {
  bulkTierForQty,
  fmt,
  variantPrice,
} from "../services/pricing";
import { resolveProductImage } from "../data/maps";

export function BuyNowProductSection({
  product,
  variant,
  colorName,
  price,
  listPrice,
  promoPrice,
  stock,
  out,
  qty,
  setQty,
  onPickVariant,
  bulkPct,
  bulkDiscount,
  subtotalBefore,
  subtotal,
}: {
  product: Product;
  variant: Variant | null | undefined;
  colorName: string;
  price: number;
  listPrice: number;
  promoPrice: number | null;
  stock: number;
  out: boolean;
  qty: number;
  setQty: (updater: (q: number) => number) => void;
  onPickVariant: (v: Variant) => void;
  bulkPct: number;
  bulkDiscount: number;
  subtotalBefore: number;
  subtotal: number;
}) {
  const bulkTier = bulkTierForQty(qty);

  return (
    <section aria-label={`Sản phẩm đặt mua: ${product.name}`} className="min-w-0">
      <div className="flex gap-3">
        <img
          src={resolveProductImage(variant ? variant.imageKey : product.imageKey)}
          alt={`Mô hình ${product.name} màu ${colorName} tỉ lệ ${product.scale}`}
          className="h-24 w-28 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0">
          <h4 className="text-lg font-black leading-snug">{product.name}</h4>
          <p className="mt-0.5 text-xs font-semibold text-[var(--dim)]">
            {product.brand} · {product.vehicleType} · Tỉ lệ {product.scale}
          </p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
            <p className="text-xl font-black tabular-nums text-[var(--accent)]">
              {fmt(price)}
            </p>
            {promoPrice ? (
              <p className="text-sm tabular-nums text-[var(--dim)] line-through">
                {fmt(listPrice)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {product.variants.length > 1 ? (
        <div className="mt-4">
          <p className="text-sm font-semibold">
            Màu sắc: <span className="font-bold">{colorName}</span>
          </p>
          <div className="mt-2 overflow-hidden rounded-2xl border border-[var(--border)]">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 bg-[var(--surface2)] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[var(--dim)]">
              <span>Màu</span>
              <span>Giá</span>
              <span>Trạng thái</span>
            </div>
            {product.variants.map((v) => {
              const active = variant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onPickVariant(v)}
                  aria-pressed={active}
                  aria-label={`Chọn màu ${v.colorName} cho ${product.name}, giá ${fmt(variantPrice(v))}, ${v.stock > 0 ? `còn ${v.stock} chiếc` : "hết hàng"}`}
                  className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-[var(--border)] px-3 py-2.5 text-left text-sm transition ${
                    active ? "bg-[var(--surface2)] font-bold" : "hover:bg-[var(--surface2)]"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/25"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span className="truncate">{v.colorName}</span>
                    {active && <span aria-hidden className="text-[var(--accent)]">✓</span>}
                  </span>
                  <span className="tabular-nums font-black text-[var(--accent)]">
                    {fmt(variantPrice(v))}
                  </span>
                  <span
                    className={`text-xs font-bold ${v.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--accent)]"}`}
                  >
                    {v.stock > 0 ? "✓ Còn hàng" : "Hết hàng"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm font-semibold">
          Màu: <span className="font-bold">{colorName}</span>
        </p>
      )}

      <p className="mt-3 text-sm font-semibold" role="status">
        {out ? (
          <span className="text-[var(--accent)]">
            Màu {colorName} đang hết hàng — chọn màu khác còn hàng nhé
          </span>
        ) : (
          <span>
            Còn hàng · <span className="tabular-nums">{stock} chiếc</span> màu này sẵn
            sàng giao
          </span>
        )}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span id="bn-qty-label" className="text-sm font-semibold text-[var(--dim)]">
          Số lượng
        </span>
        <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
          <button
            type="button"
            aria-label="Giảm số lượng đặt mua"
            disabled={qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2.5 text-lg font-bold disabled:opacity-40"
          >
            −
          </button>
          <span
            aria-label={`Số lượng đặt mua ${qty}`}
            className="min-w-8 text-center font-bold tabular-nums"
          >
            {qty}
          </span>
          <button
            type="button"
            aria-label="Tăng số lượng đặt mua"
            disabled={qty >= stock}
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            className="px-4 py-2.5 text-lg font-bold disabled:opacity-40"
          >
            +
          </button>
        </div>
        {!out && <span className="text-xs text-[var(--dim)]">Tối đa {stock} chiếc</span>}
      </div>

      {bulkPct > 0 && (
        <p role="status" className="mt-3 rounded-xl bg-[var(--surface2)] px-3.5 py-2.5 text-sm font-semibold">
          Đang chọn mức Mua nhiều giảm nhiều: {bulkTier?.label ?? `mua ${qty}`} — giảm {bulkPct}% trên
          tổng <span className="tabular-nums">{fmt(subtotalBefore)}</span>, giảm được{" "}
          <span className="tabular-nums text-[var(--accent)]">{fmt(bulkDiscount)}</span>, tạm tính sau
          giảm <span className="tabular-nums text-[var(--accent)]">{fmt(subtotal)}</span>
        </p>
      )}

      <p className="mt-4 text-sm leading-relaxed text-[var(--dim)]">
        Bạn vui lòng nhập đúng số điện thoại — shop sẽ gọi số đó để xác nhận đơn
        hàng trước khi giao hàng.
      </p>
    </section>
  );
}
