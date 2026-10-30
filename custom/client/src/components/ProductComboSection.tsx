import type { Product, Variant } from "../types";
import { resolveProductImage } from "../data/maps";
import { fmt } from "../services/pricing";

export type BundleLine = {
  product: Product;
  variant: Variant | null;
  price: number;
  stock: number;
  checked: boolean;
  isSelf: boolean;
};

export function ProductComboSection({
  bundleLines,
  bundleTotal,
  bundleCheckedCount,
  onToggleChecked,
  onChangeVariant,
  onAddBundle,
}: {
  bundleLines: BundleLine[];
  bundleTotal: number;
  bundleCheckedCount: number;
  onToggleChecked: (productId: number, checked: boolean) => void;
  onChangeVariant: (productId: number, variantId: number) => void;
  onAddBundle: () => void;
}) {
  return (
    <section aria-label="Thường được mua cùng nhau" className="mt-12">
      <h2 className="text-xl font-black tracking-tight">Thường được mua cùng nhau</h2>

      <div className="mt-4 flex items-center gap-2" aria-hidden>
        {bundleLines.map((line, i) => (
          <div key={line.product.id} className="flex min-w-0 flex-1 items-center gap-2">
            {i > 0 && <span className="shrink-0 text-xl font-black text-[var(--dim)]">+</span>}
            <img
              src={resolveProductImage(line.variant ? line.variant.imageKey : line.product.imageKey)}
              alt=""
              className="h-20 w-full min-w-0 max-w-24 rounded-xl border border-[var(--border)] object-cover sm:h-24 sm:max-w-32"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {bundleLines.map((line) => {
          const p = line.product;
          const cleanName = p.name.replace(" [MẪU]", "");
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5">
              <input
                type="checkbox"
                checked={line.checked}
                disabled={line.isSelf || line.stock <= 0}
                onChange={(e) => onToggleChecked(p.id, e.target.checked)}
                aria-label={
                  line.isSelf
                    ? `Sản phẩm đang xem ${cleanName} — luôn được chọn`
                    : line.stock <= 0
                      ? `${cleanName} — hết hàng, không chọn được`
                      : `Chọn mua cùng ${cleanName}`
                }
                className="h-5 w-5 shrink-0 accent-[#c8102e] disabled:opacity-50"
              />
              <div className="min-w-0 flex-1 basis-48">
                <p className="text-sm font-bold leading-snug">
                  {line.isSelf && (
                    <span className="font-semibold text-[var(--dim)]">Sản phẩm này: </span>
                  )}
                  {cleanName}
                </p>
                {p.variants.length > 1 ? (
                  <label className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--dim)]">
                    Màu
                    <select
                      value={line.variant?.id ?? ""}
                      onChange={(e) => onChangeVariant(p.id, Number(e.target.value))}
                      aria-label={`Chọn màu cho ${cleanName} trong mục mua cùng nhau`}
                      className="max-w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    >
                      {p.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.colorName}
                          {v.stock <= 0 ? " (hết hàng)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="mt-1 text-xs text-[var(--dim)]">
                    Màu {line.variant ? line.variant.colorName : p.colorName}
                  </p>
                )}
                {line.stock <= 0 && (
                  <p className="mt-1 text-xs font-bold text-[var(--accent)]">
                    Màu này đang hết hàng
                  </p>
                )}
              </div>
              <p className="ml-auto shrink-0 text-base font-black tabular-nums text-[var(--accent)]">
                {fmt(line.price)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--dim)]">
          TỔNG TIỀN{" "}
          <span className="ml-1 text-xl font-black tabular-nums text-[var(--text)]">
            {fmt(bundleTotal)}
          </span>{" "}
          <span className="text-xs">({bundleCheckedCount} sản phẩm đã chọn)</span>
        </p>
        <button
          type="button"
          disabled={bundleCheckedCount === 0}
          onClick={onAddBundle}
          aria-label={`Thêm ${bundleCheckedCount} sản phẩm đã tick trong mục mua cùng nhau vào giỏ`}
          className="rounded-full bg-[var(--accent)] px-6 py-3.5 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Thêm vào giỏ
        </button>
      </div>
    </section>
  );
}

