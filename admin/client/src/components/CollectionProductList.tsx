import { useState, useMemo } from "react";
import type { Product } from "../types";
import type { CollectionKind } from "../utils/collectionRules";
import { fmtVND, totalStock, defaultVariant } from "../utils/format";
import { Icon, Thumb, ICONS } from "./shared";

export type CollectionSortKey =
  | "manual"
  | "titleAsc"
  | "titleDesc"
  | "priceDesc"
  | "priceAsc"
  | "newest"
  | "oldest";

export function CollectionProductList({
  mode,
  sortKey,
  onSortChange,
  products,
  manualIds,
  onAddManual,
  onRemoveManual,
  onBulkRemove,
  onMoveManual,
  onOpenProduct,
  displayedProducts,
  sortedProducts,
  positionIndexOf,
  autoMatchedCount,
  matchMode,
  title,
}: {
  mode: CollectionKind;
  sortKey: CollectionSortKey;
  onSortChange: (k: CollectionSortKey) => void;
  products: Product[];
  manualIds: number[];
  onAddManual: (id: number) => void;
  onRemoveManual: (id: number) => void;
  onBulkRemove: (ids: number[]) => void;
  onMoveManual: (i: number, dir: -1 | 1) => void;
  onOpenProduct: (p: Product) => void;
  displayedProducts: Product[];
  sortedProducts: Product[];
  positionIndexOf: Map<number, number>;
  autoMatchedCount: number;
  matchMode: string;
  title: string;
}) {
  const [addSearch, setAddSearch] = useState("");
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<number>>(new Set());

  const addResults = useMemo(() => {
    const q = addSearch.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          !manualIds.includes(p.id) &&
          (p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.scale.includes(q)),
      )
      .slice(0, 8);
  }, [products, manualIds, addSearch]);

  const selectCls =
    "rounded-lg border border-[var(--border)] bg-white px-2 py-2 text-sm outline-none focus:border-[var(--accent)]";

  const productStatus = (p: Product) =>
    totalStock(p) > 0 ? (
      <span className="inline-block rounded bg-[#dcf2e3] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[#14663c]">
        Còn hàng
      </span>
    ) : (
      <span className="inline-block rounded bg-[#fbe3e3] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[#9c2b2b]">
        Hết hàng
      </span>
    );

  const productRow = (p: Product, idx: number, editable: boolean) => (
    <div
      key={p.id}
      className="flex flex-wrap items-center gap-2.5 border-b border-[var(--border)] py-2.5 last:border-0 sm:flex-nowrap"
    >
      {editable ? (
        <input
          type="checkbox"
          aria-label={`Chọn sản phẩm ${p.name} trong bộ`}
          checked={checkedIds.has(p.id)}
          onChange={(e) =>
            setCheckedIds((prev) => {
              const next = new Set(prev);
              if (e.target.checked) next.add(p.id);
              else next.delete(p.id);
              return next;
            })
          }
          className="h-4 w-4 shrink-0"
        />
      ) : (
        <span className="w-4 shrink-0" aria-hidden />
      )}
      <span className="flex w-16 shrink-0 items-center gap-1">
        <span className="w-5 text-center text-sm font-medium">{idx + 1}</span>
        {editable && sortKey === "manual" && (
          <span className="flex flex-col">
            <button
              type="button"
              aria-label={`Đưa ${p.name} lên một vị trí`}
              disabled={idx === 0}
              onClick={() => onMoveManual(idx, -1)}
              className="px-1 text-xs leading-3 text-[var(--dim)] disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              aria-label={`Đưa ${p.name} xuống một vị trí`}
              disabled={idx === displayedProducts.length - 1}
              onClick={() => onMoveManual(idx, 1)}
              className="px-1 text-xs leading-3 text-[var(--dim)] disabled:opacity-30"
            >
              ▼
            </button>
          </span>
        )}
      </span>
      <button
        type="button"
        aria-label={`Mở chi tiết sản phẩm ${p.name}`}
        onClick={() => onOpenProduct(p)}
        className="shrink-0 rounded-md transition-opacity hover:opacity-80"
      >
        <Thumb product={p} size={40} />
      </button>
      <span className="min-w-0 flex-1 basis-40">
        <button
          type="button"
          aria-label={`Mở chi tiết sản phẩm ${p.name}`}
          onClick={() => onOpenProduct(p)}
          className="block max-w-full truncate text-left text-sm font-medium text-[var(--accent)] hover:underline"
        >
          {p.name}
        </button>
        <span className="block text-xs text-[var(--dim)]">
          {p.brand} · Tỉ lệ {p.scale} · {p.vehicleType} ·{" "}
          {fmtVND(defaultVariant(p)?.promoPrice ?? defaultVariant(p)?.price ?? 0)}
        </span>
      </span>
      {productStatus(p)}
      {editable && (
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
          className="rounded-lg border border-[#e3b3b3] px-2.5 py-1 text-sm text-[#9c2b2b]"
        >
          Bỏ
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="mt-3">
        <select
          id="cd-sort"
          aria-label="Sắp xếp sản phẩm trong bộ"
          className={`${selectCls} w-full max-w-72`}
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as CollectionSortKey)}
        >
          <option value="manual">Thủ công (theo vị trí đã xếp)</option>
          <option value="titleAsc">Tiêu đề sản phẩm A-Z</option>
          <option value="titleDesc">Tiêu đề sản phẩm Z-A</option>
          <option value="priceDesc">Giá cao nhất</option>
          <option value="priceAsc">Giá thấp nhất</option>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      {mode === "manual" ? (
        <>
          <div className="mt-3">
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--dim)]">
                <Icon d={ICONS.search} size={16} />
              </span>
              <input
                type="search"
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                placeholder="Tìm sản phẩm để thêm vào bộ"
                aria-label="Tìm sản phẩm để thêm vào bộ"
                className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)]"
              />
            </div>
            {addSearch.trim() && (
              <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                {addResults.length === 0 && (
                  <li className="text-sm text-[var(--dim)]">
                    Không còn sản phẩm nào khớp để thêm.
                  </li>
                )}
                {addResults.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <Thumb product={p} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      <span className="block text-xs text-[var(--dim)]">
                        {p.brand} · Tỉ lệ {p.scale} · Tồn {totalStock(p)}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Thêm ${p.name} vào bộ ${title}`}
                      onClick={() => onAddManual(p.id)}
                      className="rounded-lg bg-[var(--accent)] px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
                    >
                      Thêm
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-2 hidden grid-cols-[1rem_4rem_2.5rem_1fr_auto] items-center gap-2.5 border-b border-[var(--border)] pb-1 text-xs font-medium text-[var(--dim)] sm:grid">
            <span aria-hidden />
            <span>Vị trí</span>
            <span>Ảnh</span>
            <span>Tiêu đề sản phẩm</span>
            <span>Trạng thái</span>
          </div>
          {displayedProducts.length === 0 ? (
            <p className="py-4 text-sm text-[var(--dim)]">
              Bộ này chưa có sản phẩm nào — tìm sản phẩm ở trên rồi bấm Thêm.
            </p>
          ) : (
            sortedProducts.map((p) =>
              productRow(p, positionIndexOf.get(p.id) ?? 0, true),
            )
          )}
          {checkedIds.size > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Đã chọn {checkedIds.size} sản phẩm</span>
              <button
                type="button"
                onClick={() => {
                  onBulkRemove(Array.from(checkedIds));
                  setCheckedIds(new Set());
                }}
                className="rounded-lg border border-[#e3b3b3] px-3 py-1.5 text-sm font-medium text-[#9c2b2b]"
              >
                Bỏ các sản phẩm đã chọn khỏi bộ
              </button>
              <button
                type="button"
                onClick={() => setCheckedIds(new Set())}
                className="text-sm text-[var(--accent)] underline"
              >
                Bỏ chọn
              </button>
            </div>
          )}
          <p className="mt-2 text-xs text-[var(--dim)]">
            Thêm, bỏ và đổi vị trí ở đây được ghi vào database chung khi bấm Lưu ở cuối
            trang — sản phẩm trong bộ hiện thẻ tag tên bộ này ở trang chi tiết của nó.
          </p>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-[var(--dim)]">
            Chế độ Tự động: danh sách tự tính theo điều kiện ở trên (
            {matchMode === "all" ? "khớp tất cả điều kiện" : "khớp bất kỳ điều kiện nào"})
            — hiện đang khớp {autoMatchedCount} sản phẩm, tự cập nhật khi sản phẩm
            hoặc điều kiện thay đổi.
          </p>
          <div className="mt-2 hidden grid-cols-[1rem_4rem_2.5rem_1fr_auto] items-center gap-2.5 border-b border-[var(--border)] pb-1 text-xs font-medium text-[var(--dim)] sm:grid">
            <span aria-hidden />
            <span>Vị trí</span>
            <span>Ảnh</span>
            <span>Tiêu đề sản phẩm</span>
            <span>Trạng thái</span>
          </div>
          {displayedProducts.length === 0 ? (
            <p className="py-4 text-sm text-[var(--dim)]">
              Chưa có sản phẩm nào khớp điều kiện hiện tại.
            </p>
          ) : (
            sortedProducts.map((p) =>
              productRow(p, positionIndexOf.get(p.id) ?? 0, false),
            )
          )}
        </>
      )}
    </div>
  );
}

