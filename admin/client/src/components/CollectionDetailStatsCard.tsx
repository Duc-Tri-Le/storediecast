import { cardCls, inputCls, labelCls } from "./shared";
import { fmtVND } from "../utils/format";

export function CollectionDetailStatsCard({
  status,
  setStatus,
  visibleOnList,
  setVisibleOnList,
  totalItemsCount,
  totalStockCount,
  priceRange,
}: {
  status: "published" | "draft";
  setStatus: (s: "published" | "draft") => void;
  visibleOnList: boolean;
  setVisibleOnList: (v: boolean) => void;
  totalItemsCount: number;
  totalStockCount: number;
  priceRange: { min: number; max: number } | null;
}) {
  return (
    <section className={`${cardCls} p-5 space-y-4`} aria-label="Trạng thái & Hiển thị">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--dim)]">
        Trạng thái & Hiển thị
      </h2>

      <div>
        <label className={labelCls} htmlFor="col-status">
          Trạng thái bộ sưu tập
        </label>
        <select
          id="col-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "published" | "draft")}
          className={`${inputCls} text-xs font-semibold`}
        >
          <option value="published">Đang bán trên web (Công khai)</option>
          <option value="draft">Bản nháp (Tạm ẩn)</option>
        </select>
      </div>

      <div className="border-t border-[var(--border)] pt-3.5">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={visibleOnList}
            onChange={(e) => setVisibleOnList(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-[var(--accent)]"
          />
          <div className="text-xs">
            <span className="font-semibold text-[var(--text)] block">
              Hiển thị trên danh sách bộ sưu tập
            </span>
            <span className="text-[var(--dim)] text-[11px] block mt-0.5 leading-relaxed">
              Khách hàng có thể tìm và duyệt bộ sưu tập này tại trang Bộ sưu tập của web.
            </span>
          </div>
        </label>
      </div>

      {/* Tóm tắt thống kê */}
      <div className="border-t border-[var(--border)] pt-3.5 space-y-2.5">
        <h3 className="text-xs font-bold text-[var(--text)]">Thống kê nhanh</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--sidebar)]/60 p-2.5">
            <span className="text-[11px] text-[var(--dim)] block">Số mẫu xe</span>
            <span className="text-base font-bold text-[var(--text)]">
              {totalItemsCount}
            </span>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--sidebar)]/60 p-2.5">
            <span className="text-[11px] text-[var(--dim)] block">Tổng tồn kho</span>
            <span className="text-base font-bold text-[var(--text)]">
              {totalStockCount}
            </span>
          </div>
        </div>

        {priceRange && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--sidebar)]/60 p-3 text-center text-xs">
            <span className="text-[11px] text-[var(--dim)] block">Khoảng giá trong bộ</span>
            <span className="font-bold text-[var(--accent)] mt-0.5 block">
              {fmtVND(priceRange.min)}
              {priceRange.max > priceRange.min ? ` — ${fmtVND(priceRange.max)}` : ""}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

