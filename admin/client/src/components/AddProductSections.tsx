import type { RefObject } from "react";
import type { AddVariant } from "../utils/productFormTypes";
import { addVariantImageShape } from "../utils/productFormTypes";
import { colorHex, directImageSrc } from "../utils/format";
import { cardCls, inputCls, labelCls } from "./shared";
import { DraftThumb, renderRichText, VariantImagePicker } from "./VariantImagePicker";

const toolBtn =
  "rounded-md border border-[var(--border)] bg-white px-2 py-1 text-sm hover:bg-[var(--sidebar)]";

export function AddProductTitleDescSection({
  name,
  setName,
  description,
  setDescription,
  descPreview,
  setDescPreview,
  descRef,
}: {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  descPreview: boolean;
  setDescPreview: (v: boolean | ((s: boolean) => boolean)) => void;
  descRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const wrapSelection = (before: string, after: string) => {
    const ta = descRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? description.length;
    const end = ta.selectionEnd ?? description.length;
    const sel = description.slice(start, end) || "văn bản";
    setDescription(description.slice(0, start) + before + sel + after + description.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  const prefixLines = (prefix: string) => {
    const ta = descRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const lineStart = description.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const seg = description.slice(lineStart, end);
    setDescription(
      description.slice(0, lineStart) +
        seg.split("\n").map((l) => (l.trim() ? prefix + l : l)).join("\n") +
        description.slice(end),
    );
    requestAnimationFrame(() => ta.focus());
  };

  return (
    <section className={cardCls} aria-label="Tiêu đề và mô tả">
      <label className={labelCls} htmlFor="ap-name">Tiêu đề</label>
      <input
        id="ap-name"
        className={inputCls}
        value={name}
        maxLength={160}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ví dụ: Toyota GR Supra"
      />
      <p className="mt-1 text-right text-xs text-[var(--dim)]">{name.length} / 160</p>

      <label className={labelCls} htmlFor="ap-desc">Mô tả</label>
      <div className="flex flex-wrap gap-1.5" role="toolbar" aria-label="Định dạng mô tả">
        <button type="button" aria-label="In đậm" onClick={() => wrapSelection("**", "**")} className={`${toolBtn} font-bold`}>B</button>
        <button type="button" aria-label="In nghiêng" onClick={() => wrapSelection("*", "*")} className={`${toolBtn} italic`}>I</button>
        <button type="button" aria-label="Gạch chân" onClick={() => wrapSelection("__", "__")} className={`${toolBtn} underline`}>U</button>
        <button type="button" aria-label="Danh sách gạch đầu dòng" onClick={() => prefixLines("• ")} className={toolBtn}>• Danh sách</button>
        <button
          type="button"
          aria-pressed={descPreview}
          onClick={() => setDescPreview((s) => !s)}
          className={toolBtn}
        >
          {descPreview ? "Đang xem trước" : "Xem trước"}
        </button>
      </div>
      {descPreview ? (
        <div className="mt-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
          {description ? renderRichText(description) : <p className="text-[var(--dim)]">Chưa có mô tả.</p>}
        </div>
      ) : (
        <textarea
          id="ap-desc"
          ref={descRef}
          className={`${inputCls} mt-2`}
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả sản phẩm — dùng **đậm**, *nghiêng*, __gạch chân__ và gạch đầu dòng •"
        />
      )}
      <p className="mt-1 text-xs text-[var(--dim)]">
        Định dạng dùng ký hiệu **đậm**, *nghiêng*, __gạch chân__ lưu kèm trong mô tả.
      </p>
    </section>
  );
}

export function AddProductMediaSection({
  variants,
  targetIdx,
  setMediaTarget,
  onPickMediaUrl,
  onPickMediaFile,
  onSelectVariantMedia,
  mediaFileRef,
  onMediaFile,
}: {
  variants: AddVariant[];
  targetIdx: number;
  setMediaTarget: (i: number) => void;
  onPickMediaUrl: () => void;
  onPickMediaFile: () => void;
  onSelectVariantMedia: (i: number) => void;
  mediaFileRef: RefObject<HTMLInputElement | null>;
  onMediaFile: (f: File | undefined) => void;
}) {
  return (
    <section className={cardCls} aria-label="Media">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-sm font-bold">Media ({variants.length} / 500)</h2>
        <button
          type="button"
          onClick={onPickMediaUrl}
          className="text-sm font-medium text-[var(--accent)]"
        >
          Thêm media từ URL
        </button>
        <button
          type="button"
          onClick={onPickMediaFile}
          className="text-sm font-medium text-[var(--accent)]"
        >
          Thêm media từ máy
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="ap-media-target" className="text-[var(--dim)]">Ảnh mới sẽ gắn cho:</label>
        <select
          id="ap-media-target"
          className="rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-sm"
          value={targetIdx}
          onChange={(e) => setMediaTarget(Number(e.target.value))}
        >
          {variants.map((v, i) => (
            <option key={i} value={i}>
              Màu {i + 1}{v.colorName ? ` — ${v.colorName}` : ""}
            </option>
          ))}
        </select>
        <input
          ref={mediaFileRef}
          type="file"
          accept="image/*"
          aria-label="Thêm media từ máy"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            void onMediaFile(f);
          }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {variants.map((v, i) => {
          const shape = addVariantImageShape(v);
          const src = directImageSrc(shape.linkUrl || shape.uploadDataUrl || "");
          const isTarget = i === targetIdx;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectVariantMedia(i)}
              aria-label={`Ảnh màu ${i + 1}${v.colorName ? ` — ${v.colorName}` : ""}`}
              className={`overflow-hidden rounded-lg border text-left ${
                isTarget ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]" : "border-[var(--border)]"
              }`}
            >
              {src ? (
                <img src={src} alt="" className="h-20 w-full object-cover" loading="lazy" />
              ) : (
                <span
                  className="flex h-20 w-full flex-col items-center justify-center gap-1"
                  style={{ background: `linear-gradient(135deg, ${colorHex(v.colorName)}33, ${colorHex(v.colorName)}11)` }}
                >
                  <span
                    className="block rounded-full border border-black/10"
                    style={{ width: 22, height: 22, background: colorHex(v.colorName) }}
                  />
                  <span className="max-w-full truncate px-1 font-mono text-[10px] text-[var(--dim)]">
                    {v.catalogKey}
                  </span>
                </span>
              )}
              <span className="block truncate px-2 py-1 text-xs">
                {v.colorName || `Màu ${i + 1}`} ·{" "}
                {v.imageMode === "link" ? "Từ link" : v.imageMode === "upload" ? "Từ máy" : "Có sẵn"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[var(--dim)]">
        Mỗi màu có 1 ảnh. Bấm vào một ảnh để mở phần chọn ảnh của màu đó trong mục
        Variants bên dưới (từ link, từ máy hoặc ảnh có sẵn).
      </p>
    </section>
  );
}

export function AddProductVariantsSection({
  variants,
  setVariants,
  openPicker,
  setOpenPicker,
  imageKeys,
}: {
  variants: AddVariant[];
  setVariants: (fn: (vs: AddVariant[]) => AddVariant[]) => void;
  openPicker: number | null;
  setOpenPicker: (i: number | null) => void;
  imageKeys: string[];
}) {
  const setVariant = (i: number, patch: Partial<AddVariant>) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  return (
    <section className={cardCls} aria-label="Variants">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-sm font-bold">Variants ({variants.length})</h2>
        <button
          type="button"
          onClick={() => {
            setVariants((vs) => [
              ...vs,
              {
                colorName: "",
                sellPrice: "",
                compareAt: "",
                costPrice: "",
                stock: "0",
                barcode: "",
                variantTag: "",
                imageMode: "link",
                catalogKey: "scale132",
                linkUrl: "",
                linkState: "idle",
                uploadDataUrl: "",
                uploadName: "",
                uploadError: null,
              },
            ]);
            setOpenPicker(variants.length);
          }}
          className="text-sm font-medium text-[var(--accent)]"
        >
          Thêm biến thể
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--dim)]">
        Thêm biến thể nếu sản phẩm có nhiều phiên bản, ví dụ nhiều màu khác nhau. Màu
        đầu tiên là màu mặc định trên web khách.
      </p>
      <div className="mt-3 space-y-3">
        {variants.map((v, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] shadow-[var(--shadow-card)] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <DraftThumb v={addVariantImageShape(v)} />
              <div className="min-w-40 flex-1">
                <label className={labelCls} htmlFor={`ap-color-${i}`}>
                  Màu {i + 1}{i === 0 ? " (mặc định)" : ""}
                </label>
                <input
                  id={`ap-color-${i}`}
                  className={inputCls}
                  value={v.colorName}
                  onChange={(e) => setVariant(i, { colorName: e.target.value })}
                  placeholder="Đỏ"
                />
              </div>
              <span className="font-mono text-xs text-[var(--dim)]">SKU: tự sinh khi lưu</span>
              {variants.length > 1 && (
                <button
                  type="button"
                  aria-label={`Bỏ màu ${i + 1}`}
                  onClick={() => {
                    setVariants((vs) => vs.filter((_, idx) => idx !== i));
                    setOpenPicker(null);
                  }}
                  className="rounded-lg border border-[#e3b3b3] px-2.5 py-1.5 text-sm text-[#9c2b2b]"
                >
                  Bỏ màu
                </button>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <label className={labelCls} htmlFor={`ap-vprice-${i}`}>Giá bán (₫)</label>
                <input
                  id={`ap-vprice-${i}`}
                  className={inputCls}
                  inputMode="numeric"
                  value={v.sellPrice}
                  onChange={(e) => setVariant(i, { sellPrice: e.target.value })}
                  placeholder="449000"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor={`ap-vcompare-${i}`}>Giá so sánh (₫)</label>
                <input
                  id={`ap-vcompare-${i}`}
                  className={inputCls}
                  inputMode="numeric"
                  value={v.compareAt}
                  onChange={(e) => setVariant(i, { compareAt: e.target.value })}
                  placeholder="Trống = không KM"
                />
              </div>
              <div>
                <label className={labelCls} htmlFor={`ap-vstock-${i}`}>Tồn kho</label>
                <input
                  id={`ap-vstock-${i}`}
                  className={inputCls}
                  inputMode="numeric"
                  value={v.stock}
                  onChange={(e) => setVariant(i, { stock: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor={`ap-vbarcode-${i}`}>Mã vạch</label>
                <input
                  id={`ap-vbarcode-${i}`}
                  className={inputCls}
                  value={v.barcode}
                  onChange={(e) => setVariant(i, { barcode: e.target.value })}
                  placeholder="Tùy chọn"
                />
              </div>
            </div>
            {openPicker === i && (
              <div className="mt-2">
                <VariantImagePicker
                  v={addVariantImageShape(v)}
                  imageKeys={imageKeys}
                  idPrefix={`ap-img-${i}`}
                  onChange={(patch) =>
                    setVariant(i, {
                      imageMode: patch.imageMode ?? v.imageMode,
                      catalogKey: patch.catalogKey ?? v.catalogKey,
                      linkUrl: patch.linkUrl ?? v.linkUrl,
                      linkState: patch.linkState ?? v.linkState,
                      uploadDataUrl: patch.uploadDataUrl ?? v.uploadDataUrl,
                      uploadName: patch.uploadName ?? v.uploadName,
                      uploadError: patch.uploadError ?? v.uploadError,
                    })
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
