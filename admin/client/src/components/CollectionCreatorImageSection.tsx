import { useRef, useState } from "react";
import { cardCls, Icon } from "./shared";
import { directImageSrc } from "../utils/format";

export function CollectionCreatorImageSection({
  title,
  imageKey,
  imageName,
  imageError,
  setImageKey,
  setImageName,
  onFileSelect,
}: {
  title: string;
  imageKey: string;
  imageName: string;
  imageError: string | null;
  setImageKey: (k: string) => void;
  setImageName: (n: string) => void;
  onFileSelect: (f?: File) => void | Promise<void>;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className={`${cardCls} p-5`} aria-label="Ảnh bộ sưu tập">
      <h2 className="text-base font-bold text-[var(--text)]">Ảnh đại diện</h2>
      <p className="mt-0.5 text-xs text-[var(--dim)]">
        Hình ảnh minh họa xuất hiện ở trang danh mục và banner
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          void onFileSelect(e.dataTransfer.files?.[0]);
        }}
        className={`mt-3 cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${
          isDragOver
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--sidebar)]"
        }`}
      >
        {directImageSrc(imageKey) ? (
          <div className="relative">
            <img
              src={directImageSrc(imageKey) ?? undefined}
              alt={`Ảnh bộ sưu tập ${title}`}
              className="mx-auto max-h-48 rounded-lg object-cover shadow-xs"
            />
            <p className="mt-2 text-xs font-semibold text-[var(--accent)]">
              Nhấp hoặc kéo thả ảnh mới để thay thế
            </p>
          </div>
        ) : (
          <div className="py-3">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sidebar)] text-[var(--accent)]">
              <Icon d="M12 16V5 M7.5 9 12 4.5 16.5 9 M4 20h16" size={18} />
            </div>
            <span className="mt-3 inline-block text-xs font-bold text-[var(--accent)]">
              Tải ảnh lên
            </span>
            <p className="mt-1 text-[11px] text-[var(--dim)]">
              Kéo và thả ảnh vào đây, hoặc nhấp để chọn tệp từ máy
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void onFileSelect(f);
        }}
      />

      {imageName && <p className="mt-2 text-xs text-[var(--dim)]">Đã chọn: {imageName}</p>}
      {imageError && (
        <p className="mt-2 rounded-lg bg-[#fbe3e3] p-2 text-xs text-[#9c2b2b]">{imageError}</p>
      )}

      {imageKey && (
        <button
          type="button"
          onClick={() => {
            setImageKey("");
            setImageName("");
          }}
          className="mt-2 text-xs font-semibold text-[#c0392b] hover:underline"
        >
          Xóa ảnh đại diện
        </button>
      )}
    </section>
  );
}

