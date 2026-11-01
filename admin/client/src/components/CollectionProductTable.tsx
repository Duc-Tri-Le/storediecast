import type { Product } from "../types";
import type { CollectionKind } from "../utils/collectionRules";
import type { CollectionSortKey } from "./CollectionProductList";
import { fmtVND, totalStock, defaultVariant } from "../utils/format";
import { Icon, Thumb } from "./shared";

export interface CollectionProductTableProps {
  mode: CollectionKind;
  sortKey: CollectionSortKey;
  displayedProducts: Product[];
  sortedProducts: Product[];
  positionIndexOf: Map<number, number>;
  checkedIds: ReadonlySet<number>;
  setCheckedIds: React.Dispatch<React.SetStateAction<ReadonlySet<number>>>;
  allSelected: boolean;
  toggleSelectAll: () => void;
  onOpenProduct?: (p: Product) => void;
  onMoveManual: (i: number, dir: -1 | 1) => void;
  onRemoveManual: (id: number) => void;
  title: string;
}

export function CollectionProductTable({
  mode,
  sortKey,
  displayedProducts,
  sortedProducts,
  positionIndexOf,
  checkedIds,
  setCheckedIds,
  allSelected,
  toggleSelectAll,
  onOpenProduct,
  onMoveManual,
  onRemoveManual,
  title,
}: CollectionProductTableProps) {
  const productStatus = (p: Product) => {
    const st = totalStock(p);
    if (st <= 0) {
      return (
        <span className="inline-block rounded-md bg-[#fce8e6] px-2 py-0.5 text-[11px] font-semibold text-[#c5221f]">
          Hết hàng
        </span>
      );
    }
    if (st <= 3) {
      return (
        <span className="inline-block rounded-md bg-[#fef7e0] px-2 py-0.5 text-[11px] font-semibold text-[#b06000]">
          Sắp hết ({st})
        </span>
      );
    }
    return (
      <span className="inline-block rounded-md bg-[#e6f4ea] px-2 py-0.5 text-[11px] font-semibold text-[#137333]">
        Còn hàng ({st})
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-2xs">
      {/* Table Head */}
      {mode === "auto" ? (
        <div className="grid grid-cols-[3.5rem_3.5rem_1fr_auto] items-center gap-4 border-b border-[var(--border)] bg-[var(--sidebar)]/60 px-5 sm:px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--dim)]">
          <span className="text-center">STT</span>
          <span className="text-center">Ảnh</span>
          <span>Tên sản phẩm & Thông tin</span>
          <span className="text-right">Trạng thái</span>
        </div>
      ) : (
        <div className="grid grid-cols-[2.5rem_3.5rem_3.5rem_1fr_auto_2.5rem] items-center gap-4 border-b border-[var(--border)] bg-[var(--sidebar)]/60 px-5 sm:px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--dim)]">
          <div className="flex justify-center">
            <input
              type="checkbox"
              aria-label="Chọn tất cả sản phẩm"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded accent-[var(--accent)]"
            />
          </div>
          <span className="text-center">Vị trí</span>
          <span className="text-center">Ảnh</span>
          <span>Tên sản phẩm & Thông tin</span>
          <span className="text-center">Trạng thái</span>
          <span className="text-right">Xóa</span>
        </div>
      )}

      {/* Table Body */}
      {displayedProducts.length === 0 ? (
        <div className="p-10 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sidebar)] text-[var(--dim)]">
            <Icon d="M4 6h16M4 12h16M4 18h7" size={20} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">
            {mode === "manual"
              ? "Bộ sưu tập này chưa có sản phẩm nào"
              : "Chưa có sản phẩm nào khớp với điều kiện hiện tại"}
          </p>
          <p className="text-xs text-[var(--dim)] max-w-md mx-auto leading-relaxed">
            {mode === "manual"
              ? "Dùng ô tìm kiếm phía trên để thêm các mẫu xe mô hình vào bộ này."
              : "Hãy kiểm tra hoặc nới lỏng các điều kiện lọc (tỉ lệ, hãng xe, loại xe...) ở khối Điều kiện."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {sortedProducts.map((p) => {
            const idx = positionIndexOf.get(p.id) ?? 0;
            const v = defaultVariant(p);
            const price = v ? v.promoPrice || v.price : 0;
            const isChecked = checkedIds.has(p.id);

            if (mode === "auto") {
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-[3.5rem_3.5rem_1fr_auto] items-center gap-4 px-5 sm:px-6 py-3 transition-colors hover:bg-[var(--sidebar)]/40"
                >
                  {/* STT */}
                  <div className="text-center font-mono text-xs text-[var(--dim)]">
                    {idx + 1}
                  </div>

                  {/* Ảnh */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => onOpenProduct?.(p)}
                      className="shrink-0 rounded-lg border border-[var(--border)] p-0.5 bg-white shadow-2xs transition hover:border-[var(--accent)]"
                    >
                      <Thumb product={p} size={36} />
                    </button>
                  </div>

                  {/* Tên & thông tin */}
                  <div className="min-w-0 pr-2">
                    <button
                      type="button"
                      onClick={() => onOpenProduct?.(p)}
                      className="block truncate text-left text-xs font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                      title={p.name}
                    >
                      {p.name}
                    </button>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--dim)]">
                      <span className="font-medium text-[var(--text)]/80">{p.brand}</span>
                      {" · "}
                      <span>Tỉ lệ {p.scale}</span>
                      {" · "}
                      <span>{p.vehicleType}</span>
                      {" · "}
                      <span className="font-semibold text-[var(--accent)]">{fmtVND(price)}</span>
                    </p>
                  </div>

                  {/* Trạng thái tồn kho */}
                  <div className="text-right">{productStatus(p)}</div>
                </div>
              );
            }

            return (
              <div
                key={p.id}
                className={`grid grid-cols-[2.5rem_3.5rem_3.5rem_1fr_auto_2.5rem] items-center gap-4 px-5 sm:px-6 py-3 transition-colors ${
                  isChecked ? "bg-[var(--accent-soft)]/25" : "hover:bg-[var(--sidebar)]/40"
                }`}
              >
                {/* Checkbox */}
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      setCheckedIds((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(p.id);
                        else next.delete(p.id);
                        return next;
                      })
                    }
                    className="h-4 w-4 rounded accent-[var(--accent)]"
                  />
                </div>

                {/* Vị trí & Nút đổi thứ tự khi sắp xếp thủ công */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-4 text-center font-mono text-xs text-[var(--dim)]">
                    {idx + 1}
                  </span>
                  {sortKey === "manual" && (
                    <span className="flex flex-col">
                      <button
                        type="button"
                        aria-label={`Đưa ${p.name} lên một vị trí`}
                        disabled={idx === 0}
                        onClick={() => onMoveManual(idx, -1)}
                        className="text-[10px] leading-3 text-[var(--dim)] hover:text-[var(--accent)] disabled:opacity-20 transition"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        aria-label={`Đưa ${p.name} xuống một vị trí`}
                        disabled={idx === displayedProducts.length - 1}
                        onClick={() => onMoveManual(idx, 1)}
                        className="text-[10px] leading-3 text-[var(--dim)] hover:text-[var(--accent)] disabled:opacity-20 transition"
                      >
                        ▼
                      </button>
                    </span>
                  )}
                </div>

                {/* Ảnh đại diện */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => onOpenProduct?.(p)}
                    className="shrink-0 rounded-lg border border-[var(--border)] p-0.5 bg-white shadow-2xs transition hover:border-[var(--accent)]"
                  >
                    <Thumb product={p} size={36} />
                  </button>
                </div>

                {/* Tên & thông tin */}
                <div className="min-w-0 pr-2">
                  <button
                    type="button"
                    onClick={() => onOpenProduct?.(p)}
                    className="block truncate text-left text-xs font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                    title={p.name}
                  >
                    {p.name}
                  </button>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--dim)]">
                    <span className="font-medium text-[var(--text)]/80">{p.brand}</span>
                    {" · "}
                    <span>Tỉ lệ {p.scale}</span>
                    {" · "}
                    <span>{p.vehicleType}</span>
                    {" · "}
                    <span className="font-semibold text-[var(--accent)]">{fmtVND(price)}</span>
                  </p>
                </div>

                {/* Trạng thái tồn kho */}
                <div className="text-center">{productStatus(p)}</div>

                {/* Nút xóa khỏi bộ */}
                <div className="text-right">
                  <button
                    type="button"
                    aria-label={`Bỏ ${p.name} khỏi bộ ${title}`}
                    onClick={() => {
                      onRemoveManual(p.id);
                      setCheckedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(p.id);
                        return next;
                      });
                    }}
                    className="rounded-lg p-1.5 text-[var(--dim)] hover:bg-[#fce8e6] hover:text-[#c5221f] transition"
                    title="Bỏ khỏi bộ sưu tập này"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
