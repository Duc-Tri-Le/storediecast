export function getPaginationItems(current: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Trường hợp ở gần đầu: 1, 2, 3, 4, ..., totalPages
  if (current <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  // Trường hợp ở gần cuối: 1, ..., totalPages-3, totalPages-2, totalPages-1, totalPages
  if (current >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // Trường hợp ở giữa: 1, ..., current-1, current, current+1, ..., totalPages
  return [1, "...", current - 1, current, current + 1, "...", totalPages];
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemUnit?: string;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemUnit = "sản phẩm",
  onPageChange,
}: PaginationProps) {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const items = getPaginationItems(currentPage, totalPages);

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white p-3 shadow-xs sm:flex-row sm:px-4">
      {/* Thông tin số lượng */}
      <div className="text-xs text-[var(--dim)] sm:text-sm">
        Hiển thị <span className="font-semibold text-[var(--text)]">{startItem}</span>
        {" – "}
        <span className="font-semibold text-[var(--text)]">{endItem}</span>
        {" trong tổng số "}
        <span className="font-semibold text-[var(--text)]">{totalItems}</span>
        {` ${itemUnit}`}
        {totalPages > 1 && (
          <span className="ml-1 text-[var(--dim)]">
            (Trang {currentPage}/{totalPages})
          </span>
        )}
      </div>

      {/* Cụm nút điều hướng */}
      {totalPages > 1 && (
        <nav className="flex items-center gap-1.5" aria-label="Phân trang">
          {/* Nút Trước < */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Trang trước"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-base font-bold text-[var(--text)] transition-colors hover:bg-[var(--sidebar)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            &lt;
          </button>

          {/* Danh sách các số trang */}
          {items.map((item, idx) => {
            if (item === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-9 w-7 items-center justify-center text-sm font-bold text-[var(--dim)] select-none"
                >
                  ...
                </span>
              );
            }

            const active = item === currentPage;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={active ? "page" : undefined}
                aria-label={`Trang ${item}`}
                className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--sidebar)]"
                }`}
              >
                {item}
              </button>
            );
          })}

          {/* Nút Sau > */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Trang sau"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-base font-bold text-[var(--text)] transition-colors hover:bg-[var(--sidebar)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            &gt;
          </button>
        </nav>
      )}
    </div>
  );
}
