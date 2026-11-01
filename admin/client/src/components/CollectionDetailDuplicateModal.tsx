export function CollectionDetailDuplicateModal({
  duplicatePrompt,
  onCancel,
  onConfirm,
  isSaving,
}: {
  duplicatePrompt: { open: boolean; message: string; scale?: string } | null;
  onCancel: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}) {
  if (!duplicatePrompt?.open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fef7e0] text-[#b06000] border border-[#f9ab00]/30 text-xl">
            ⚠️
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--text)]">
              Xác nhận lưu bộ sưu tập
            </h3>
            <p className="text-xs text-[var(--dim)] leading-relaxed">
              {duplicatePrompt.message}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--sidebar)]/50 p-4 text-xs text-[var(--text)] leading-relaxed space-y-1.5">
          <p className="font-semibold text-[var(--accent)]">
            Bạn có muốn tiếp tục lưu bộ sưu tập này không?
          </p>
          <p className="text-[11px] text-[var(--dim)]">
            Nếu chọn <strong>"Vẫn lưu"</strong>, hệ thống sẽ cho phép lưu và áp dụng điều kiện tỉ lệ này vào bộ sưu tập hiện tại.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            disabled={isSaving}
            onClick={onCancel}
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--sidebar)] transition shadow-2xs"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--accent-dark)] transition disabled:opacity-50"
          >
            {isSaving ? "Đang lưu…" : "Vẫn lưu bộ sưu tập"}
          </button>
        </div>
      </div>
    </div>
  );
}

