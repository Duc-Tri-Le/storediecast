import type { RefObject } from "react";
import type { CollectionKind } from "../utils/collectionRules";
import { cardCls, inputCls, labelCls } from "./shared";

export function CollectionCreatorBasicInfo({
  title,
  setTitle,
  description,
  setDescription,
  descRef,
  mode,
  setMode,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  descRef: RefObject<HTMLTextAreaElement | null>;
  mode: CollectionKind;
  setMode: (m: CollectionKind) => void;
}) {
  return (
    <>
      {/* Card 1: Thông tin cơ bản */}
      <section className={`${cardCls} p-5 space-y-4`} aria-label="Thông tin bộ sưu tập">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls} htmlFor="cc-title">
              Tên bộ sưu tập <span className="text-[#c0392b]">*</span>
            </label>
            <span className="text-[11px] text-[var(--dim)]">{title.length}/120 ký tự</span>
          </div>
          <input
            id="cc-title"
            className={`${inputCls} text-base font-semibold`}
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Siêu Xe Tỉ Lệ 1:18, Mô Hình Ferrari Cao Cấp..."
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="cc-desc">
            Mô tả bộ sưu tập
          </label>
          <textarea
            id="cc-desc"
            ref={descRef}
            rows={4}
            className={`${inputCls} text-xs leading-relaxed`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập nội dung giới thiệu ngắn về bộ sưu tập này để khách hàng hiểu rõ hơn..."
          />
        </div>
      </section>

      {/* Card 2: Chế độ gom sản phẩm */}
      <section className={`${cardCls} p-5`} aria-label="Loại bộ sưu tập">
        <h2 className="text-base font-bold text-[var(--text)]">Loại bộ sưu tập</h2>
        <p className="mt-0.5 text-xs text-[var(--dim)]">
          Chọn phương thức bạn muốn tập hợp các sản phẩm vào bộ sưu tập này
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
              mode === "manual"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]/20 shadow-xs ring-1 ring-[var(--accent)]"
                : "border-[var(--border)] hover:bg-[var(--sidebar)]"
            }`}
          >
            <input
              type="radio"
              name="cc-mode"
              checked={mode === "manual"}
              onChange={() => setMode("manual")}
              className="mt-1 h-4 w-4 text-[var(--accent)]"
            />
            <div className="flex-1 text-sm">
              <span className="font-bold text-[var(--text)]">Thủ công (Manual)</span>
              <p className="mt-0.5 text-xs text-[var(--dim)]">
                Bạn tự tay chọn từng mẫu xe cụ thể muốn đưa vào bộ sưu tập.
              </p>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
              mode === "auto"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]/20 shadow-xs ring-1 ring-[var(--accent)]"
                : "border-[var(--border)] hover:bg-[var(--sidebar)]"
            }`}
          >
            <input
              type="radio"
              name="cc-mode"
              checked={mode === "auto"}
              onChange={() => setMode("auto")}
              className="mt-1 h-4 w-4 text-[var(--accent)]"
            />
            <div className="flex-1 text-sm">
              <span className="font-bold text-[var(--text)]">Tự động (Automated)</span>
              <p className="mt-0.5 text-xs text-[var(--dim)]">
                Các sản phẩm hiện có và sản phẩm thêm mới trong tương lai khớp với điều kiện sẽ tự động được thêm vào bộ sưu tập này.
              </p>
            </div>
          </label>
        </div>
      </section>
    </>
  );
}

