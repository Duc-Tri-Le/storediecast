import { BackButton, Icon } from "./shared";

export function CollectionDetailHeader({
  title,
  status,
  isBase,
  totalItemsCount,
  mode,
  liveCollectionUrl,
  isDirty,
  isSaving,
  onBack,
  onPreview,
  onDiscard,
  onSave,
}: {
  title: string;
  status: "published" | "draft";
  isBase: boolean;
  totalItemsCount: number;
  mode: "manual" | "auto";
  liveCollectionUrl: string;
  isDirty: boolean;
  isSaving: boolean;
  onBack: () => void;
  onPreview: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const toolBtn =
    "rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold hover:bg-[var(--sidebar)] transition shadow-2xs";

  return (
    <>
      <div>
        <BackButton label="Bộ sưu tập" onClick={onBack} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
              {title || "Bộ sưu tập chưa đặt tên"}
            </h1>

            {/* Status pill */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status === "published"
                  ? "bg-[#e6f4ea] text-[#137333]"
                  : "bg-[#f1f3f4] text-[#5f6368]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "published"
                    ? "bg-[#137333] shadow-[0_0_6px_#13733388]"
                    : "bg-[#80868b]"
                }`}
              />
              {status === "published" ? "Đang bán trên web" : "Bản nháp (Đã tắt)"}
            </span>

            {/* Base scale badge */}
            {isBase && (
              <span className="rounded-full bg-[#fef7e0] px-2.5 py-0.5 text-xs font-medium text-[#b06000] border border-[#f9ab00]/30 shadow-2xs">
                ⭐ Bộ theo tỉ lệ gốc
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--dim)]">
            {mode === "auto" ? "Gom sản phẩm tự động theo điều kiện" : "Gom sản phẩm thủ công"} ·{" "}
            <strong className="text-[var(--text)]">{totalItemsCount}</strong> mẫu xe mô hình trong bộ
          </p>
        </div>

        {/* Action buttons at top header */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={liveCollectionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text)] shadow-2xs hover:bg-[var(--sidebar)] transition"
            title="Bấm để mở xem thử trên Web Bán Hàng cho khách"
          >
            <span>Xem trên web khách</span>
            <span className="text-[var(--accent)] font-bold text-sm leading-none">↗</span>
          </a>

          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text)] shadow-2xs hover:bg-[var(--sidebar)] transition"
          >
            <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" size={14} />
            <span>Xem trước</span>
          </button>

          {isDirty && (
            <>
              <button
                type="button"
                onClick={onDiscard}
                className={toolBtn}
              >
                Hủy thay đổi
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={onSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--accent-dark)] disabled:opacity-50"
              >
                {isSaving ? "Đang lưu…" : "Lưu thay đổi"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

