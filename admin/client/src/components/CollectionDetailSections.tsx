import { useState, useRef } from "react";
import type { CatalogData } from "../types";
import type {
  CollectionCondition,
  ConditionKind,
  ConditionOperator,
  MatchMode,
} from "../utils/collectionRules";
import {
  CONDITION_KIND_LABELS,
  CONDITION_OPERATOR_LABELS_EN,
} from "../utils/collectionRules";
import { directImageSrc } from "../utils/format";
import { Icon, cardCls, labelCls, inputCls, smallBtn } from "./shared";

export function CollectionConditionsSection({
  conditions,
  matchMode,
  onChangeMatchMode,
  onChangeCondition,
  onAddCondition,
  onRemoveCondition,
  catalog,
  allTags,
}: {
  conditions: CollectionCondition[];
  matchMode: MatchMode;
  onChangeMatchMode: (m: MatchMode) => void;
  onChangeCondition: (i: number, patch: Partial<CollectionCondition>) => void;
  onAddCondition: () => void;
  onRemoveCondition: (i: number) => void;
  catalog: CatalogData | null;
  allTags: string[];
}) {
  const selectCls =
    "rounded-lg border border-[var(--border)] bg-white px-2 py-2 text-sm outline-none focus:border-[var(--accent)]";

  const conditionOptions = (kind: ConditionKind): string[] => {
    if (kind === "tag") return allTags;
    if (!catalog) return [];
    if (kind === "scale") return catalog.scales.map((e) => e.name);
    if (kind === "brand") return catalog.carBrands.map((e) => e.name);
    if (kind === "vehicleType") return catalog.vehicleTypes.map((e) => e.name);
    return catalog.modelMakers.map((e) => e.name);
  };

  return (
    <section className={cardCls} aria-label="Điều kiện của bộ sưu tập">
      <h2 className="text-base font-bold">Điều kiện</h2>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span>Sản phẩm phải khớp:</span>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="cd-match"
            checked={matchMode === "all"}
            onChange={() => onChangeMatchMode("all")}
          />
          tất cả điều kiện
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="cd-match"
            checked={matchMode === "any"}
            onChange={() => onChangeMatchMode("any")}
          />
          bất kỳ điều kiện nào
        </label>
      </div>
      <div className="mt-3 space-y-2">
        {conditions.map((c, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor={`cd-cond-field-${i}`}>
              Trường điều kiện {i + 1}
            </label>
            <select
              id={`cd-cond-field-${i}`}
              aria-label={`Trường điều kiện ${i + 1}`}
              className={`${selectCls} w-36 shrink-0`}
              value={c.kind}
              onChange={(e) =>
                onChangeCondition(i, {
                  kind: e.target.value as ConditionKind,
                  value: "",
                })
              }
            >
              {(Object.keys(CONDITION_KIND_LABELS) as ConditionKind[]).map((k) => (
                <option key={k} value={k}>
                  {CONDITION_KIND_LABELS[k]}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`cd-cond-op-${i}`}>
              Toán tử điều kiện {i + 1}
            </label>
            <select
              id={`cd-cond-op-${i}`}
              aria-label={`Toán tử điều kiện ${i + 1}`}
              className={`${selectCls} w-36 shrink-0`}
              value={c.operator}
              onChange={(e) =>
                onChangeCondition(i, {
                  operator: e.target.value as ConditionOperator,
                })
              }
            >
              {(
                Object.keys(CONDITION_OPERATOR_LABELS_EN) as ConditionOperator[]
              ).map((o) => (
                <option key={o} value={o}>
                  {CONDITION_OPERATOR_LABELS_EN[o]}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`cd-cond-value-${i}`}>
              Giá trị điều kiện {i + 1}
            </label>
            <select
              id={`cd-cond-value-${i}`}
              aria-label={`Giá trị điều kiện ${i + 1}`}
              className={`${selectCls} min-w-40 flex-1`}
              value={c.value}
              onChange={(e) => onChangeCondition(i, { value: e.target.value })}
            >
              <option value="">
                — Chọn {CONDITION_KIND_LABELS[c.kind].toLowerCase()} —
              </option>
              {conditionOptions(c.kind).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
              {c.value && !conditionOptions(c.kind).includes(c.value) && (
                <option value={c.value}>{c.value}</option>
              )}
            </select>
            <button
              type="button"
              aria-label={`Xóa điều kiện ${i + 1}`}
              disabled={conditions.length <= 1}
              onClick={() => onRemoveCondition(i)}
              className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 text-sm text-[#9c2b2b] disabled:opacity-40"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAddCondition}
        className={`${smallBtn} mt-3`}
      >
        Thêm điều kiện khác
      </button>
      <p className="mt-2 text-xs text-[var(--dim)]">
        Giá trị của Loại xe, Hãng xe, Hãng mô hình và Tỉ lệ lấy đúng từ Quản lý danh
        mục; giá trị Thẻ lấy từ thẻ thật đang có trên sản phẩm.
      </p>
    </section>
  );
}

export function CollectionSeoSection({
  title,
  description,
  seoTitle,
  seoDescription,
  seoOpen,
  onToggleSeo,
  onChangeSeoTitle,
  onChangeSeoDesc,
}: {
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoOpen: boolean;
  onToggleSeo: () => void;
  onChangeSeoTitle: (v: string) => void;
  onChangeSeoDesc: (v: string) => void;
}) {
  return (
    <section className={cardCls} aria-label="Xem trước hiển thị trên công cụ tìm kiếm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Xem trước hiển thị trên công cụ tìm kiếm</h2>
        <button
          type="button"
          aria-expanded={seoOpen}
          onClick={onToggleSeo}
          className="text-sm font-medium text-[var(--accent)]"
        >
          Sửa SEO
        </button>
      </div>
      <div className="mt-3 rounded-lg border border-[var(--border)] px-4 py-3">
        <p className="text-base text-[#1558b0]">{seoTitle.trim() || title}</p>
        <p className="text-xs text-[#3d7a44]">
          Web bán hàng › Bộ sưu tập ›{" "}
          {(title || "bo-suu-tap").toLowerCase().replace(/\s+/g, "-")}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-[var(--dim)]">
          {seoDescription.trim() ||
            description.trim() ||
            "Thêm tiêu đề và mô tả để xem bộ sưu tập này có thể hiện thế nào trong kết quả tìm kiếm."}
        </p>
      </div>
      {seoOpen && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="cd-seo-title">
              Tiêu đề SEO
            </label>
            <input
              id="cd-seo-title"
              className={inputCls}
              value={seoTitle}
              maxLength={200}
              onChange={(e) => onChangeSeoTitle(e.target.value)}
              placeholder={title}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="cd-seo-desc">
              Mô tả SEO
            </label>
            <input
              id="cd-seo-desc"
              className={inputCls}
              value={seoDescription}
              maxLength={1000}
              onChange={(e) => onChangeSeoDesc(e.target.value)}
              placeholder="Để trống thì dùng mô tả của bộ"
            />
          </div>
        </div>
      )}
    </section>
  );
}

export function CollectionImageSection({
  title,
  imageKey,
  imageName,
  imageError,
  onImageFile,
  onRemoveImage,
}: {
  title: string;
  imageKey: string;
  imageName: string;
  imageError: string | null;
  onImageFile: (f: File | undefined) => void;
  onRemoveImage: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);

  return (
    <section className={cardCls} aria-label="Ảnh bộ sưu tập">
      <h2 className="text-base font-bold">Ảnh bộ sưu tập</h2>
      <div
        role="button"
        tabIndex={0}
        aria-label="Tải ảnh bộ sưu tập lên từ máy"
        onClick={() => imageFileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            imageFileRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void onImageFile(e.dataTransfer.files?.[0]);
        }}
        className={`mt-3 cursor-pointer rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors ${
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border)] hover:border-[var(--accent)]"
        }`}
      >
        {directImageSrc(imageKey) ? (
          <img
            src={directImageSrc(imageKey) ?? undefined}
            alt={`Ảnh bộ sưu tập ${title}`}
            className="mx-auto max-h-44 rounded-lg object-cover"
          />
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold">
              <Icon d="M12 16V5 M7.5 9 12 4.5 16.5 9 M4 20h16" size={15} /> Tải lên
            </span>
            <p className="mt-2 text-sm text-[var(--dim)]">
              Kéo thả ảnh vào đây hoặc bấm để tải ảnh lên từ máy
            </p>
          </>
        )}
      </div>
      <input
        ref={imageFileRef}
        type="file"
        accept="image/*"
        aria-label="Chọn ảnh bộ sưu tập từ máy"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void onImageFile(f);
        }}
      />
      {imageName && (
        <p className="mt-2 text-xs text-[var(--dim)]">Đã chọn: {imageName}</p>
      )}
      {imageError && (
        <p className="mt-2 rounded-lg bg-[#fbe3e3] px-3 py-2 text-sm text-[#9c2b2b]">
          {imageError}
        </p>
      )}
      {imageKey && (
        <button
          type="button"
          onClick={onRemoveImage}
          className="mt-2 rounded-lg border border-[#e3b3b3] px-3 py-1.5 text-sm text-[#9c2b2b]"
        >
          Bỏ ảnh
        </button>
      )}
      <p className="mt-2 text-xs text-[var(--dim)]">
        Ảnh được nén và lưu vào database chung khi bấm Lưu — web bán hàng đọc cùng
        database nên dùng được ảnh này.
      </p>
    </section>
  );
}

export { CollectionPreviewModal } from "./CollectionPreviewModal";
