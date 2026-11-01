import React from "react";
import { cardCls, labelCls, inputCls } from "./shared";
import { renderRichText } from "./VariantImagePicker";

export function CollectionDetailBasicInfo({
  title,
  setTitle,
  description,
  setDescription,
  descPreview,
  setDescPreview,
  descRef,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  descPreview: boolean;
  setDescPreview: (v: boolean) => void;
  descRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <section className={`${cardCls} p-5 space-y-4`} aria-label="Thông tin cơ bản">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls} htmlFor="col-title">
            Tên bộ sưu tập <span className="text-[#c0392b]">*</span>
          </label>
          <span className="text-[11px] text-[var(--dim)] font-mono">
            {title.length}/120 ký tự
          </span>
        </div>
        <input
          id="col-title"
          className={`${inputCls} text-base font-semibold`}
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Siêu xe thể thao, Mô hình 1:18 cao cấp..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls} htmlFor="col-desc">
            Mô tả bộ sưu tập
          </label>
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--sidebar)] p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setDescPreview(false)}
              className={`rounded-md px-2.5 py-1 transition ${
                !descPreview
                  ? "bg-white font-bold text-[var(--text)] shadow-xs"
                  : "text-[var(--dim)]"
              }`}
            >
              Soạn thảo
            </button>
            <button
              type="button"
              onClick={() => setDescPreview(true)}
              className={`rounded-md px-2.5 py-1 transition ${
                descPreview
                  ? "bg-white font-bold text-[var(--text)] shadow-xs"
                  : "text-[var(--dim)]"
              }`}
            >
              Xem trước
            </button>
          </div>
        </div>

        {!descPreview ? (
          <textarea
            id="col-desc"
            ref={descRef}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Giới thiệu về dòng xe, điểm nổi bật của bộ sưu tập này để khách hàng dễ chọn lựa..."
            className={`${inputCls} text-xs leading-relaxed`}
          />
        ) : (
          <div className="min-h-[105px] rounded-lg border border-[var(--border)] bg-[var(--sidebar)]/30 px-3 py-2.5 text-xs">
            {description.trim() ? (
              <div className="prose prose-sm max-w-none text-[var(--text)]">
                {renderRichText(description)}
              </div>
            ) : (
              <p className="text-[var(--dim)] italic">Chưa có mô tả.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

