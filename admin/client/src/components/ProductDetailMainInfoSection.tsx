import { useState, type RefObject } from "react";
import type { CatalogData } from "../types";
import { cardCls, inputCls, labelCls } from "./shared";
import { renderRichText } from "./VariantImagePicker";
import { getProductNameError } from "../utils/productValidation";

/**
 * Phần thông tin chính của xe mô hình:
 * Tên sản phẩm, 4 thông số kỹ thuật xe mô hình (Hãng, Tỉ lệ, Loại xe, Hãng SX), Mô tả sản phẩm
 */
export function ProductDetailMainInfoSection({
  name,
  setName,
  brand,
  setBrand,
  scale,
  setScale,
  vehicleType,
  setVehicleType,
  modelMaker,
  setModelMaker,
  catalog,
  description,
  setDescription,
  descRef,
}: {
  name: string;
  setName: (n: string) => void;
  brand: string;
  setBrand: (b: string) => void;
  scale: string;
  setScale: (s: string) => void;
  vehicleType: string;
  setVehicleType: (t: string) => void;
  modelMaker: string;
  setModelMaker: (m: string) => void;
  catalog: CatalogData | null;
  description: string;
  setDescription: (d: string) => void;
  descRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const [descTab, setDescTab] = useState<"edit" | "preview">("edit");
  const nameErr = getProductNameError(name);

  return (
    <section className={`${cardCls} p-4 sm:p-5 space-y-4`} aria-label="Thông tin sản phẩm">
      {/* Tiêu đề sản phẩm */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls} htmlFor="pd-name">
            Tên mô hình xe <span className="text-[#c0392b]">*</span>
          </label>
          <span className="text-[11px] font-medium text-[var(--dim)]">
            {name.length}/160 ký tự
          </span>
        </div>
        {nameErr && (
          <span className="block text-[10px] text-[#c0392b] font-semibold leading-tight mb-1">
            {nameErr}
          </span>
        )}
        <input
          id="pd-name"
          className={`${inputCls} text-base font-semibold transition ${
            nameErr ? "border-[#c0392b] bg-[#fff8f8] focus:border-[#c0392b]" : ""
          }`}
          value={name}
          maxLength={160}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Ferrari F8 Tributo, Toyota GR Supra..."
        />
      </div>

      {/* Grid 4 thông số kỹ thuật xe mô hình */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--table-head)]/40 p-3 sm:p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-3">
          Thông số xe mô hình
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Hãng xe */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--dim)]" htmlFor="pd-brand">
              Hãng xe
            </label>
            <select
              id="pd-brand"
              className={`${inputCls} text-xs font-medium`}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="">— Chọn hãng —</option>
              {(catalog?.carBrands ?? []).map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tỉ lệ */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--dim)]" htmlFor="pd-scale">
              Tỉ lệ
            </label>
            <select
              id="pd-scale"
              className={`${inputCls} text-xs font-medium`}
              value={scale}
              onChange={(e) => setScale(e.target.value)}
            >
              <option value="">— Chọn tỉ lệ —</option>
              {(catalog?.scales ?? []).map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Loại xe */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--dim)]" htmlFor="pd-type">
              Loại xe
            </label>
            <select
              id="pd-type"
              className={`${inputCls} text-xs font-medium`}
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="">— Chọn loại —</option>
              {(catalog?.vehicleTypes ?? []).map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hãng làm mô hình */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--dim)]" htmlFor="pd-maker">
              Hãng mô hình
            </label>
            <select
              id="pd-maker"
              className={`${inputCls} text-xs font-medium`}
              value={modelMaker}
              onChange={(e) => setModelMaker(e.target.value)}
            >
              <option value="">— Chọn hãng SX —</option>
              {(catalog?.modelMakers ?? []).map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mô tả sản phẩm với tab Xem trước tinh gọn */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls} htmlFor="pd-desc">
            Mô tả sản phẩm
          </label>
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--sidebar)] p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setDescTab("edit")}
              className={`rounded-md px-2.5 py-1 transition ${
                descTab === "edit" ? "bg-white font-bold text-[var(--text)] shadow-xs" : "text-[var(--dim)]"
              }`}
            >
              Soạn thảo
            </button>
            <button
              type="button"
              onClick={() => setDescTab("preview")}
              className={`rounded-md px-2.5 py-1 transition ${
                descTab === "preview" ? "bg-white font-bold text-[var(--text)] shadow-xs" : "text-[var(--dim)]"
              }`}
            >
              Xem trước
            </button>
          </div>
        </div>

        {descTab === "edit" ? (
          <textarea
            id="pd-desc"
            ref={descRef}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả chi tiết về sản phẩm (hỗ trợ định dạng văn bản)..."
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

