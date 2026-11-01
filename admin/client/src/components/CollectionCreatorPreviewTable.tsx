import type { Product } from "../types";
import { cardCls, Thumb } from "./shared";
import { totalStock } from "../utils/format";

export function CollectionCreatorPreviewTable({
  previewProducts,
}: {
  previewProducts: Product[];
}) {
  return (
    <section className={`${cardCls} p-5`} aria-label="Xem trước sản phẩm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Sản phẩm trong bộ sưu tập</h2>
          <p className="mt-0.5 text-xs text-[var(--dim)]">
            {previewProducts.length > 0
              ? `Hiện có ${previewProducts.length} sản phẩm sẽ thuộc bộ sưu tập này`
              : "Chưa có sản phẩm nào trong bộ sưu tập"}
          </p>
        </div>
        <span className="rounded-full bg-[var(--sidebar)] px-2.5 py-0.5 text-xs font-bold text-[var(--dim)]">
          {previewProducts.length} sản phẩm
        </span>
      </div>

      {previewProducts.length > 0 ? (
        <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[var(--table-head)] font-semibold text-[var(--dim)] uppercase">
              <tr>
                <th className="px-3 py-2">Sản phẩm</th>
                <th className="px-3 py-2">Hãng xe</th>
                <th className="px-3 py-2">Tỉ lệ</th>
                <th className="px-3 py-2 text-right">Tồn kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-white">
              {previewProducts.slice(0, 30).map((p) => (
                <tr key={p.id} className="hover:bg-[var(--sidebar)]">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Thumb product={p} size={28} />
                      <span className="truncate font-medium text-[var(--text)]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[var(--dim)]">{p.brand}</td>
                  <td className="px-3 py-2 font-bold text-[var(--dim)]">{p.scale}</td>
                  <td className="px-3 py-2 text-right font-medium">{totalStock(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {previewProducts.length > 30 && (
            <p className="bg-[var(--sidebar)] py-2 text-center text-xs text-[var(--dim)]">
              + {previewProducts.length - 30} sản phẩm khác...
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-xs text-[var(--dim)]">
          Chưa có sản phẩm nào. Chọn sản phẩm thủ công hoặc thiết lập điều kiện tự động ở trên.
        </div>
      )}
    </section>
  );
}

