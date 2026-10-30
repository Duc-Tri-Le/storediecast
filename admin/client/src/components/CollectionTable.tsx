import type { CollectionRow, CollectionStatus } from "../utils/collectionRules";

export function CollectionTable({
  visible,
  selectedId,
  selectedRowIds,
  confirmDeleteId,
  allDeletableVisibleSelected,
  deletableVisibleCount,
  onSelectRow,
  onToggleSelectAll,
  onToggleSelectRow,
  onOpenDetail,
  onToggleStatus,
  onConfirmDelete,
  onCancelDelete,
  onDeleteDirect,
}: {
  visible: CollectionRow[];
  selectedId: string | null;
  selectedRowIds: ReadonlySet<string>;
  confirmDeleteId: string | null;
  allDeletableVisibleSelected: boolean;
  deletableVisibleCount: number;
  onSelectRow: (id: string | null) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectRow: (row: CollectionRow, checked: boolean) => void;
  onOpenDetail: (id: string) => void;
  onToggleStatus: (row: CollectionRow) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onDeleteDirect: (row: CollectionRow) => void;
}) {
  const statusChip = (status: CollectionStatus) =>
    status === "published" ? (
      <span className="inline-block rounded bg-[#b9ecc9] px-3 py-1 text-xs font-medium whitespace-nowrap text-[#14532d]">
        Đã đăng
      </span>
    ) : (
      <span className="inline-block rounded bg-[#e9f1f9] px-3 py-1 text-xs font-medium whitespace-nowrap text-[#47617c]">
        Nháp
      </span>
    );

  const conditionCell = (row: CollectionRow) => {
    if (row.kind === "manual") {
      return (
        <p className="text-sm text-[var(--dim)]">
          Không có điều kiện tự động — sản phẩm được thêm thủ công vào bộ này.
        </p>
      );
    }
    if (row.lines.length === 0) {
      return <span className="text-sm text-[var(--dim)]">Chưa có điều kiện</span>;
    }
    return (
      <div className="text-sm">
        {row.lines.map((l, i) => (
          <p key={i} className="leading-6">
            {l}
          </p>
        ))}
      </div>
    );
  };

  const rowActions = (row: CollectionRow) => {
    if (row.isBase || !row.custom) {
      return (
        <button
          type="button"
          onClick={() => onOpenDetail(row.id)}
          className="text-sm font-medium text-[var(--accent)]"
        >
          {row.id === selectedId ? "Đóng chi tiết" : "Xem chi tiết"}
        </button>
      );
    }
    if (confirmDeleteId === row.id) {
      return (
        <span className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onDeleteDirect(row)}
            className="text-sm font-medium text-[#9c2b2b]"
          >
            Xóa hẳn
          </button>
          <button
            type="button"
            onClick={onCancelDelete}
            className="text-sm text-[var(--dim)]"
          >
            Hủy
          </button>
        </span>
      );
    }
    return (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => onOpenDetail(row.id)}
          className="text-sm font-medium text-[var(--accent)]"
        >
          {row.id === selectedId ? "Đóng" : "Chi tiết"}
        </button>
        <button
          type="button"
          onClick={() => onToggleStatus(row)}
          className="text-sm text-[var(--dim)] hover:text-[var(--text)]"
        >
          {row.status === "published" ? "Về nháp" : "Đăng"}
        </button>
        <button
          type="button"
          onClick={() => onConfirmDelete(row.id)}
          className="text-sm text-[#9c2b2b]"
        >
          Xóa
        </button>
      </span>
    );
  };

  return (
    <>
      <div className="hidden lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-[var(--border)] bg-[var(--table-head)] text-sm text-[var(--dim)]">
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả bộ sưu tập tự tạo đang hiện"
                  checked={allDeletableVisibleSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  className="h-4 w-4 align-middle"
                />
              </th>
              <th className="w-64 px-4 py-2.5 font-medium">Tiêu đề</th>
              <th className="w-40 px-4 py-2.5 font-medium">Trạng thái</th>
              <th className="px-4 py-2.5 font-medium">Điều kiện</th>
              <th className="w-44 px-4 py-2.5 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-[var(--border)] last:border-0 ${
                  row.id === selectedId ? "bg-[var(--sidebar)]" : ""
                }`}
              >
                <td className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    aria-label={
                      row.custom && !row.isBase
                        ? `Chọn bộ sưu tập ${row.title}`
                        : `Bộ sưu tập ${row.title} — bộ theo tỉ lệ, không được phép xóa`
                    }
                    title={
                      row.custom && !row.isBase
                        ? undefined
                        : "Bộ sưu tập theo tỉ lệ đang hiện trên web khách — không được phép xóa"
                    }
                    disabled={!row.custom || row.isBase}
                    checked={row.custom != null && !row.isBase && selectedRowIds.has(row.id)}
                    onChange={(e) => onToggleSelectRow(row, e.target.checked)}
                    className="h-4 w-4 disabled:opacity-40"
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectRow(row.id === selectedId ? null : row.id)}
                      aria-expanded={row.id === selectedId}
                      className="text-left font-medium text-[var(--accent)] hover:underline"
                    >
                      {row.title}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  {statusChip(row.status)}
                  {row.isBase && (
                    <p className="mt-1 text-xs text-[var(--dim)]">
                      Đang hiện trên web khách
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 align-top">{conditionCell(row)}</td>
                <td className="px-4 py-3 align-top">{rowActions(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[var(--border)] lg:hidden">
        <label className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium">
          <input
            type="checkbox"
            aria-label="Chọn tất cả bộ sưu tập tự tạo đang hiện"
            checked={allDeletableVisibleSelected}
            onChange={(e) => onToggleSelectAll(e.target.checked)}
            className="h-4 w-4"
          />
          Chọn tất cả bộ tự tạo đang hiện ({deletableVisibleCount})
        </label>
        {visible.map((row) => (
          <div key={row.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <span className="flex min-w-0 items-start gap-2.5">
                <input
                  type="checkbox"
                  aria-label={
                    row.custom && !row.isBase
                      ? `Chọn bộ sưu tập ${row.title}`
                      : `Bộ sưu tập ${row.title} — bộ theo tỉ lệ, không được phép xóa`
                  }
                  title={
                    row.custom && !row.isBase
                      ? undefined
                      : "Bộ sưu tập theo tỉ lệ đang hiện trên web khách — không được phép xóa"
                  }
                  disabled={!row.custom || row.isBase}
                  checked={row.custom != null && !row.isBase && selectedRowIds.has(row.id)}
                  onChange={(e) => onToggleSelectRow(row, e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={() => onSelectRow(row.id === selectedId ? null : row.id)}
                  aria-expanded={row.id === selectedId}
                  className="text-left font-medium text-[var(--accent)]"
                >
                  {row.title}
                </button>
              </span>
              {statusChip(row.status)}
            </div>
            {row.isBase && (
              <p className="mt-1 text-xs text-[var(--dim)]">
                Trạng thái: Đang hiện trên web khách
              </p>
            )}
            <div className="mt-2">{conditionCell(row)}</div>
            <div className="mt-2">{rowActions(row)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

