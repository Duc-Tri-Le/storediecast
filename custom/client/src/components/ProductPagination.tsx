export function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pageItems: Array<number | "ellipsis-left" | "ellipsis-right"> = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis-left",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "ellipsis-left",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-right",
      totalPages,
    ];
  })();

  return (
    <nav aria-label="Phân trang sản phẩm" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Trang trước"
        className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border)]"
      >
        <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      {pageItems.map((item, idx) =>
        typeof item === "string" ? (
          <span
            key={`${item}-${idx}`}
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-sm tracking-widest text-[var(--dim)]"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Trang ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
            className={`flex h-11 w-11 shrink-0 items-center justify-center text-[15px] tabular-nums transition ${
              item === currentPage
                ? "border-2 border-[var(--text)] bg-[var(--surface)] font-bold text-[var(--text)]"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--text)]"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Trang sau"
        className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border)]"
      >
        <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}

