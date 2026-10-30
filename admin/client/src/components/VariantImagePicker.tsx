import { useRef, useState, type ReactNode } from "react";
import type { DraftVariant, ImageMode } from "../utils/productFormTypes";
import { effectiveImageKey, processImageFile } from "../utils/productFormTypes";
import { colorHex, directImageSrc } from "../utils/format";
import { inputCls, labelCls } from "./shared";

export function DraftThumb({ v, size = 52 }: { v: DraftVariant; size?: number }) {
  const src = directImageSrc(effectiveImageKey(v));
  if (src) {
    return (
      <img
        src={src}
        alt={`Ảnh màu ${v.colorName || "chưa đặt tên"}`}
        loading="lazy"
        className="shrink-0 rounded-md border border-[var(--border)] object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-md border border-[var(--border)]"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colorHex(v.colorName)}33, ${colorHex(v.colorName)}11)`,
      }}
    >
      <span
        className="block rounded-full border border-black/10"
        style={{ width: size * 0.36, height: size * 0.36, background: colorHex(v.colorName) }}
      />
    </div>
  );
}

/** Bộ chọn ảnh 3 cách cho một biến thể màu: Từ link / Từ máy / Ảnh có sẵn. */
export function VariantImagePicker({
  v,
  imageKeys,
  idPrefix,
  onChange,
}: {
  v: DraftVariant;
  imageKeys: string[];
  idPrefix: string;
  onChange: (patch: Partial<DraftVariant>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const modeBtn = (mode: ImageMode, label: string) => (
    <button
      key={mode}
      type="button"
      aria-pressed={v.imageMode === mode}
      onClick={() => onChange({ imageMode: mode })}
      className={`rounded-lg px-3 py-1.5 text-sm ${
        v.imageMode === mode
          ? "bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] font-semibold text-white"
          : "border border-[var(--border)] bg-white hover:bg-[var(--sidebar)]"
      }`}
    >
      {label}
    </button>
  );

  const onLinkChange = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      onChange({ linkUrl: value, linkState: "idle" });
      return;
    }
    let valid = false;
    try {
      const u = new URL(trimmed);
      valid = u.protocol === "http:" || u.protocol === "https:";
    } catch {
      valid = false;
    }
    onChange({ linkUrl: value, linkState: valid ? "checking" : "error" });
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    const res = await processImageFile(f);
    setUploading(false);
    if ("error" in res) {
      onChange({ uploadError: res.error });
    } else {
      onChange({ uploadDataUrl: res.dataUrl, uploadName: f.name, uploadError: null });
    }
  };

  return (
    <div className="rounded-lg bg-[var(--sidebar)] p-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Cách chọn ảnh">
        {modeBtn("link", "Từ link")}
        {modeBtn("upload", "Từ máy")}
        {modeBtn("catalog", "Ảnh có sẵn")}
      </div>

      {v.imageMode === "link" && (
        <div className="mt-3">
          <label className={labelCls} htmlFor={`${idPrefix}-link`}>
            Link ảnh (URL)
          </label>
          <input
            id={`${idPrefix}-link`}
            className={inputCls}
            value={v.linkUrl}
            onChange={(e) => onLinkChange(e.target.value)}
            placeholder="https://…/anh-san-pham.jpg"
            inputMode="url"
          />
          {v.linkState === "checking" || v.linkState === "ok" ? (
            <div className="mt-2 flex items-start gap-3">
              <img
                src={v.linkUrl.trim()}
                alt="Xem trước ảnh từ link"
                className="h-20 w-24 rounded-lg border border-[var(--border)] object-cover"
                onLoad={() => {
                  if (v.linkState !== "ok") onChange({ linkState: "ok" });
                }}
                onError={() => {
                  if (v.linkState !== "error") onChange({ linkState: "error" });
                }}
              />
              <p className="text-sm text-[var(--dim)]">
                {v.linkState === "checking"
                  ? "Đang tải ảnh xem trước…"
                  : "Ảnh tải được — link này sẽ lưu vào database chung và hiện trên web bán hàng."}
              </p>
            </div>
          ) : null}
          {v.linkState === "error" && (
            <p className="mt-2 rounded-lg bg-[#fbe3e3] px-3 py-2 text-sm text-[#9c2b2b]">
              Link ảnh không hợp lệ hoặc không tải được ảnh — kiểm tra lại đường dẫn.
              Chưa lưu được sản phẩm khi ảnh đang lỗi.
            </p>
          )}
          {v.linkState === "idle" && (
            <p className="mt-2 text-sm text-[var(--dim)]">
              Dán link ảnh để xem trước. Link phải mở ra đúng file ảnh (http/https).
            </p>
          )}
        </div>
      )}

      {v.imageMode === "upload" && (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-3 py-2 text-sm font-semibold text-white"
            >
              {uploading ? "Đang xử lý ảnh…" : "Chọn ảnh từ máy"}
            </button>
            <span className="text-sm text-[var(--dim)]">
              {v.uploadName || "Chưa chọn file nào — chỉ nhận file ảnh"}
            </span>
            {v.uploadDataUrl && (
              <button
                type="button"
                onClick={() => onChange({ uploadDataUrl: "", uploadName: "", uploadError: null })}
                className="rounded-lg border border-[#e3b3b3] px-2.5 py-1 text-sm text-[#9c2b2b]"
              >
                Bỏ ảnh
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            aria-label="Chọn file ảnh từ máy"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              void onFile(f);
            }}
          />
          {v.uploadDataUrl && (
            <div className="mt-2">
              <img
                src={v.uploadDataUrl}
                alt="Xem trước ảnh tải lên từ máy"
                className="h-20 w-24 rounded-lg border border-[var(--border)] object-cover"
              />
            </div>
          )}
          {v.uploadError && (
            <p className="mt-2 rounded-lg bg-[#fbe3e3] px-3 py-2 text-sm text-[#9c2b2b]">
              {v.uploadError}
            </p>
          )}
        </div>
      )}

      {v.imageMode === "catalog" && (
        <div className="mt-3">
          <label className={labelCls} htmlFor={`${idPrefix}-catalog`}>
            Mã ảnh có sẵn trong database chung
          </label>
          <select
            id={`${idPrefix}-catalog`}
            className={inputCls}
            value={v.catalogKey}
            onChange={(e) => onChange({ catalogKey: e.target.value })}
          >
            {imageKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
            {!imageKeys.includes(v.catalogKey) && (
              <option value={v.catalogKey}>{v.catalogKey}</option>
            )}
          </select>
          <p className="mt-2 text-sm text-[var(--dim)]">
            Đây là các ảnh kệ mẫu đã có sẵn; file ảnh gốc của chúng nằm ở web bán hàng.
          </p>
        </div>
      )}
    </div>
  );
}

/** Hiển thị mô tả với định dạng **đậm**, *nghiêng*, __gạch chân__ theo dòng. */
export function renderRichText(text: string): ReactNode[] {
  const renderLine = (line: string, key: number): ReactNode => {
    const parts: ReactNode[] = [];
    const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      if (m[1] != null) parts.push(<strong key={k++}>{m[1]}</strong>);
      else if (m[2] != null) parts.push(<em key={k++}>{m[2]}</em>);
      else if (m[3] != null) parts.push(<u key={k++}>{m[3]}</u>);
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));
    return (
      <p key={key} className="min-h-5">
        {parts.length > 0 ? parts : "\u00A0"}
      </p>
    );
  };
  return text.split("\n").map((line, i) => renderLine(line, i));
}

export const BULK_TIER_ROWS: Array<{ label: string; pct: number }> = [
  { label: "2 sản phẩm", pct: 7 },
  { label: "3–4 sản phẩm", pct: 10 },
  { label: "5 sản phẩm trở lên", pct: 15 },
];

