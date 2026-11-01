import { Icon, ICONS } from "./shared";
import { fmtDate } from "../utils/format";
import { bulkActionLine } from "../utils/bulkTypes";
import { Pagination } from "./Pagination";

export interface BulkUpdateItem {
  id: number;
  createdAt: string;
  updatedProducts: number;
  updatedVariants: number;
  actions: Array<{ type: string; mode: string; value: number | null; text: string }>;
}

export interface BulkUpdateHistoryListProps {
  updates: BulkUpdateItem[];
  paginatedUpdates: BulkUpdateItem[];
  loading: boolean;
  error: string | null;
  notice: string | null;
  setNotice: (msg: string | null) => void;
  onGoCreate: () => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

export function BulkUpdateHistoryList({
  updates,
  paginatedUpdates,
  loading,
  error,
  notice,
  setNotice,
  onGoCreate,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: BulkUpdateHistoryListProps) {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold tracking-tight">Cập nhật hàng loạt</h1>
          <p className="mt-0.5 text-sm text-[var(--dim)]">
            Đổi giá, khuyến mãi, tồn kho hoặc mô tả cho nhiều sản phẩm cùng lúc theo điều kiện.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoCreate}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-dark)]"
        >
          <Icon d={ICONS.plus} size={15} /> Tạo bản cập nhật
        </button>
      </div>

      {/* Thông báo thành công */}
      {notice && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#aed6c0] bg-[#edf9f2] px-4 py-3">
          <span className="mt-0.5 text-[#14663c]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </span>
          <p className="flex-1 text-sm text-[#14663c]">{notice}</p>
          <button type="button" onClick={() => setNotice(null)} className="text-[#14663c]/60 hover:text-[#14663c]" aria-label="Đóng thông báo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-10 flex flex-col items-center gap-3 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
          <p className="text-sm text-[var(--dim)]">Đang tải dữ liệu…</p>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#e3b3b3] bg-[#fdf3f3] px-4 py-3">
          <span className="mt-0.5 text-[#9c2b2b]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </span>
          <p className="text-sm text-[#9c2b2b]">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && updates.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon d={ICONS.bulk} size={28} />
          </div>
          <p className="mt-4 text-lg font-bold text-[var(--text)]">Chưa có bản cập nhật nào</p>
          <p className="mt-1 text-sm text-[var(--dim)]">
            Bắt đầu bằng cách tạo bản cập nhật hàng loạt đầu tiên để thay đổi giá, tồn kho hoặc mô tả cho nhiều sản phẩm cùng lúc.
          </p>
          <button
            type="button"
            onClick={onGoCreate}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-dark)]"
          >
            <Icon d={ICONS.plus} size={15} /> Tạo bản cập nhật đầu tiên
          </button>
        </div>
      )}

      {/* Danh sách các bản cập nhật */}
      {updates.length > 0 && (
        <>
          <div className="mt-6 space-y-3">
            {paginatedUpdates.map((u) => (
              <div
                key={u.id}
                className="group rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[0_4px_20px_-6px_rgba(21,80,160,0.18)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
                      #{u.id}
                    </span>
                    <div>
                      <p className="font-semibold">Cập nhật hàng loạt #{u.id}</p>
                      <p className="mt-0.5 text-xs text-[var(--dim)]">{fmtDate(u.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      <Icon d={ICONS.products} size={13} />
                      {u.updatedProducts} sản phẩm
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--sidebar)] px-3 py-1 text-xs font-semibold text-[var(--dim)]">
                      {u.updatedVariants} biến thể
                    </span>
                  </div>
                </div>

                {/* Các hành động đã thực hiện */}
                <ul className="mt-3.5 space-y-1.5 rounded-lg border border-[var(--border)] bg-[var(--sidebar)]/50 p-3 text-xs">
                  {u.actions.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-[var(--text)]">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{bulkActionLine(a)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={updates.length}
            pageSize={pageSize}
            itemUnit="bản cập nhật"
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}

