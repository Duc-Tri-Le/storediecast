import type { Product } from "../types";
import { defaultVariant, fmtVND, totalStock } from "../utils/format";
import { Chip, Thumb } from "./shared";

export function ProductTable({
  visible,
  selectedIds,
  allVisibleSelected,
  toggleSelectAllVisible,
  toggleSelected,
  onEditProduct,
}: {
  visible: Product[];
  selectedIds: ReadonlySet<number>;
  allVisibleSelected: boolean;
  toggleSelectAllVisible: (checked: boolean) => void;
  toggleSelected: (id: number, checked: boolean) => void;
  onEditProduct: (p: Product) => void;
}) {
  return (
    <>
      <div className="mt-4 hidden overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--table-head)] text-xs tracking-wide text-[var(--dim)] uppercase">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả sản phẩm đang hiện"
                  checked={allVisibleSelected}
                  onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                  className="h-4 w-4 align-middle"
                />
              </th>
              <th className="px-4 py-3 font-medium">Sản phẩm</th>
              <th className="px-4 py-3 font-medium">Loại xe</th>
              <th className="px-4 py-3 font-medium">Hãng</th>
              <th className="px-4 py-3 font-medium">Tỉ lệ</th>
              <th className="px-4 py-3 font-medium">Giá</th>
              <th className="px-4 py-3 font-medium">Tồn kho</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => {
              const dv = defaultVariant(p);
              return (
                <tr
                  key={p.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--sidebar)]"
                >
                  <td className="px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      aria-label={`Chọn sản phẩm ${p.name}`}
                      checked={selectedIds.has(p.id)}
                      onChange={(e) => toggleSelected(p.id, e.target.checked)}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Mở chi tiết sản phẩm ${p.name}`}
                        onClick={() => onEditProduct(p)}
                        className="shrink-0 rounded-md transition-opacity hover:opacity-80"
                      >
                        <Thumb product={p} />
                      </button>
                      <div className="min-w-0">
                        <button
                          type="button"
                          aria-label={`Mở chi tiết sản phẩm ${p.name}`}
                          onClick={() => onEditProduct(p)}
                          className="text-left font-medium text-[var(--accent)] hover:underline"
                        >
                          {p.name}
                        </button>
                        <p className="font-mono text-xs text-[var(--dim)]">
                          {dv?.sku ?? p.sku ?? p.internalCode ?? "Chưa có SKU"}
                          {p.variants.length > 1 ? ` · ${p.variants.length} màu` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{p.vehicleType}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.brand}
                    <span className="block text-xs text-[var(--dim)]">
                      {p.modelMaker ?? "Chưa có hãng mô hình"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{p.scale}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dv?.promoPrice != null ? (
                      <span className="flex flex-col">
                        <span className="font-medium">{fmtVND(dv.promoPrice)}</span>
                        <span className="text-xs text-[var(--dim)] line-through">
                          {fmtVND(dv.price)}
                        </span>
                      </span>
                    ) : (
                      <span className="font-medium">{fmtVND(dv?.price ?? 0)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {totalStock(p) > 0 ? (
                      `${totalStock(p)} chiếc`
                    ) : (
                      <Chip tone="red">Hết hàng</Chip>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <label className="mt-4 flex items-center gap-2.5 text-sm font-medium lg:hidden">
        <input
          type="checkbox"
          aria-label="Chọn tất cả sản phẩm đang hiện"
          checked={allVisibleSelected}
          onChange={(e) => toggleSelectAllVisible(e.target.checked)}
          className="h-4 w-4"
        />
        Chọn tất cả đang hiện ({visible.length})
      </label>

      <div className="mt-3 space-y-3 lg:hidden">
        {visible.map((p) => {
          const dv = defaultVariant(p);
          return (
            <div
              key={p.id}
              className="rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] p-4"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Chọn sản phẩm ${p.name}`}
                  checked={selectedIds.has(p.id)}
                  onChange={(e) => toggleSelected(p.id, e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0"
                />
                <button
                  type="button"
                  aria-label={`Mở chi tiết sản phẩm ${p.name}`}
                  onClick={() => onEditProduct(p)}
                  className="shrink-0 rounded-md transition-opacity hover:opacity-80"
                >
                  <Thumb product={p} />
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    aria-label={`Mở chi tiết sản phẩm ${p.name}`}
                    onClick={() => onEditProduct(p)}
                    className="text-left font-medium text-[var(--accent)] hover:underline"
                  >
                    {p.name}
                  </button>
                  <p className="font-mono text-xs text-[var(--dim)]">
                    {dv?.sku ?? p.sku ?? p.internalCode ?? "Chưa có SKU"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--dim)]">
                    {p.vehicleType} · {p.brand} · {p.scale} ·{" "}
                    {p.modelMaker ?? "Chưa có hãng mô hình"}
                  </p>
                  <p className="mt-1 text-sm">
                    {dv?.promoPrice != null ? (
                      <>
                        <span className="font-semibold">{fmtVND(dv.promoPrice)}</span>{" "}
                        <span className="text-xs text-[var(--dim)] line-through">
                          {fmtVND(dv.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">{fmtVND(dv?.price ?? 0)}</span>
                    )}
                    {" · "}
                    {totalStock(p) > 0 ? `Còn ${totalStock(p)}` : "Hết hàng"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

