import type { Product } from "../types";
import { Icon, ICONS, Thumb } from "./shared";
import { totalStock } from "../utils/format";

export function CollectionCreatorManualPicker({
  pickable,
  pickedIds,
  setPickedIds,
  pickSearch,
  setPickSearch,
}: {
  pickable: Product[];
  pickedIds: number[];
  setPickedIds: (fn: (ids: number[]) => number[]) => void;
  pickSearch: string;
  setPickSearch: (s: string) => void;
}) {
  return (
    <div className="mt-5 border-t border-[var(--border)] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[var(--text)]">
          Chọn sản phẩm ({pickedIds.length} đã chọn)
        </h3>
        <div className="relative w-64 max-w-full">
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[var(--dim)]">
            <Icon d={ICONS.search} size={14} />
          </span>
          <input
            type="search"
            value={pickSearch}
            onChange={(e) => setPickSearch(e.target.value)}
            placeholder="Tìm theo tên, hãng, tỉ lệ..."
            className="w-full rounded-lg border border-[var(--border)] bg-white py-1.5 pr-2.5 pl-8 text-xs outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="mt-3 max-h-64 divide-y divide-[var(--border)] overflow-y-auto rounded-xl border border-[var(--border)] bg-white">
        {pickable.map((p) => {
          const isChecked = pickedIds.includes(p.id);
          return (
            <label
              key={p.id}
              className={`flex cursor-pointer items-center gap-3 p-2.5 transition-colors ${
                isChecked ? "bg-[var(--accent-soft)]/25" : "hover:bg-[var(--sidebar)]"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) =>
                  setPickedIds((ids) =>
                    e.target.checked ? [...ids, p.id] : ids.filter((x) => x !== p.id),
                  )
                }
                className="h-4 w-4 rounded text-[var(--accent)]"
              />
              <Thumb product={p} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[var(--text)]">{p.name}</p>
                <p className="text-[11px] text-[var(--dim)]">
                  {p.brand} · {p.scale} · {p.vehicleType} · Tồn kho: {totalStock(p)}
                </p>
              </div>
            </label>
          );
        })}
        {pickable.length === 0 && (
          <div className="p-6 text-center text-xs text-[var(--dim)]">
            Không tìm thấy sản phẩm nào khớp với từ khóa tìm kiếm.
          </div>
        )}
      </div>
    </div>
  );
}

