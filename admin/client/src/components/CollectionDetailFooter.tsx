export function CollectionDetailFooter({
  isBase,
  confirmDelete,
  setConfirmDelete,
  isDeleting,
  isSaving,
  onDelete,
  onBack,
  onSave,
}: {
  isBase: boolean;
  confirmDelete: boolean;
  setConfirmDelete: (v: boolean) => void;
  isDeleting: boolean;
  isSaving: boolean;
  onDelete: () => void;
  onBack: () => void;
  onSave: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      <div>
        {isBase ? (
          <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--sidebar)] px-3.5 py-2 text-xs font-medium text-[var(--dim)] border border-[var(--border)]">
            <span>🔒</span>
            <span>Bộ sưu tập theo tỉ lệ gốc được bảo vệ chống xóa.</span>
          </div>
        ) : confirmDelete ? (
          <div className="flex items-center gap-2 rounded-lg bg-[#fce8e6] px-3.5 py-2 text-xs text-[#c5221f]">
            <span className="font-semibold">Xác nhận xóa hẳn bộ này?</span>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onDelete}
              className="rounded-lg bg-[#c5221f] px-3 py-1 font-bold text-white shadow-2xs hover:bg-[#a51b18] transition disabled:opacity-50"
            >
              {isDeleting ? "Đang xóa…" : "Đồng ý xóa"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1 font-semibold text-[var(--text)] hover:bg-[var(--sidebar)] transition"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg border border-[#fce8e6] bg-white px-3.5 py-2 text-xs font-semibold text-[#c5221f] hover:bg-[#fce8e6] transition shadow-2xs"
          >
            Xóa bộ sưu tập
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--sidebar)] transition shadow-2xs"
        >
          Quay lại
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--accent-dark)] disabled:opacity-50"
        >
          {isSaving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

