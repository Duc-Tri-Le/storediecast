import { useId } from "react";
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
import { Icon, ICONS, inputCls } from "./shared";

export const ORDERED_CONDITION_KINDS: ConditionKind[] = [
  "brand",
  "vehicleType",
  "scale",
  "modelMaker",
  "tag",
];

export function getConditionOptions(
  kind: ConditionKind,
  catalog?: CatalogData | null,
  allTags?: string[],
): string[] {
  if (kind === "tag") return allTags ?? [];
  if (!catalog) return [];
  if (kind === "scale") return catalog.scales.map((e) => e.name);
  if (kind === "brand") return catalog.carBrands.map((e) => e.name);
  if (kind === "vehicleType") return catalog.vehicleTypes.map((e) => e.name);
  if (kind === "modelMaker") return catalog.modelMakers.map((e) => e.name);
  return [];
}

export interface ConditionRowProps {
  condition: CollectionCondition;
  index: number;
  total: number;
  onChange: (patch: Partial<CollectionCondition>) => void;
  onRemove: () => void;
  options?: string[];
  disabled?: boolean;
}

/**
 * Một dòng điều kiện dùng chung cho toàn bộ hệ thống
 * [ Loại điều kiện v ] [ Toán tử v ] [ Giá trị / Gợi ý ] [ x ]
 */
export function ConditionRow({
  condition,
  index,
  total,
  onChange,
  onRemove,
  options = [],
  disabled = false,
}: ConditionRowProps) {
  const datalistId = useId();
  const fieldLabel = CONDITION_KIND_LABELS[condition.kind] || "điều kiện";

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-[var(--border)] bg-white p-3 sm:p-3.5 shadow-2xs transition-colors focus-within:border-[var(--accent)]">
      {/* 1. Chọn loại điều kiện (Hãng xe, Loại xe, Tỉ lệ...) */}
      <div className="w-36 shrink-0">
        <label className="sr-only" htmlFor={`cond-kind-${index}`}>
          Loại điều kiện {index + 1}
        </label>
        <select
          id={`cond-kind-${index}`}
          aria-label={`Loại điều kiện ${index + 1}`}
          disabled={disabled}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--sidebar)]/40 px-3 py-2 text-xs font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] focus:bg-white"
          value={condition.kind}
          onChange={(e) => {
            const nextKind = e.target.value as ConditionKind;
            onChange({ kind: nextKind, value: "" });
          }}
        >
          {ORDERED_CONDITION_KINDS.map((k) => (
            <option key={k} value={k}>
              {CONDITION_KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Chọn toán tử (equals, not equals, contains...) */}
      <div className="w-32 shrink-0">
        <label className="sr-only" htmlFor={`cond-op-${index}`}>
          Toán tử điều kiện {index + 1}
        </label>
        <select
          id={`cond-op-${index}`}
          aria-label={`Toán tử điều kiện ${index + 1}`}
          disabled={disabled}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--sidebar)]/40 px-3 py-2 text-xs font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] focus:bg-white"
          value={condition.operator}
          onChange={(e) =>
            onChange({ operator: e.target.value as ConditionOperator })
          }
        >
          {(Object.keys(CONDITION_OPERATOR_LABELS_EN) as ConditionOperator[]).map((o) => (
            <option key={o} value={o}>
              {CONDITION_OPERATOR_LABELS_EN[o]}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Ô nhập giá trị có datalist gợi ý thông minh từ catalog hoặc tag */}
      <div className="min-w-44 flex-1">
        <label className="sr-only" htmlFor={`cond-val-${index}`}>
          Giá trị điều kiện {index + 1}
        </label>
        <input
          id={`cond-val-${index}`}
          type="text"
          list={options.length > 0 ? datalistId : undefined}
          aria-label={`Giá trị điều kiện ${index + 1}`}
          disabled={disabled}
          className={`${inputCls} border-[var(--border)] bg-[var(--sidebar)]/30 px-3 py-2 text-xs font-medium focus:bg-white`}
          value={condition.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder={`Nhập ${fieldLabel.toLowerCase()}...`}
        />
        {options.length > 0 && (
          <datalist id={datalistId}>
            {options.map((opt) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        )}
      </div>

      {/* 4. Nút xóa điều kiện */}
      <button
        type="button"
        aria-label={`Xóa điều kiện ${index + 1}`}
        disabled={disabled || total <= 1}
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-[#9c2b2b] transition-all hover:border-[#f5c2c2] hover:bg-[#fdf3f3] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        title={total <= 1 ? "Cần tối thiểu 1 điều kiện" : "Xóa điều kiện này"}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export interface ConditionsBuilderProps {
  conditions: CollectionCondition[];
  matchMode?: MatchMode;
  onChangeMatchMode?: (mode: MatchMode) => void;
  onChangeCondition: (index: number, patch: Partial<CollectionCondition>) => void;
  onAddCondition: () => void;
  onRemoveCondition: (index: number) => void;
  catalog?: CatalogData | null;
  allTags?: string[];
  disabled?: boolean;
  showMatchMode?: boolean;
  addLabel?: string;
}

/**
 * Khối xây dựng danh sách điều kiện dùng chung
 * Bao gồm:
 * - Chọn chế độ Khớp tất cả (VÀ) / Khớp bất kỳ (HOẶC)
 * - Danh sách ConditionRow với nhãn liên kết VÀ/HOẶC
 * - Nút "+ Thêm điều kiện"
 */
export function ConditionsBuilder({
  conditions,
  matchMode = "all",
  onChangeMatchMode,
  onChangeCondition,
  onAddCondition,
  onRemoveCondition,
  catalog,
  allTags,
  disabled = false,
  showMatchMode = true,
  addLabel = "Thêm điều kiện",
}: ConditionsBuilderProps) {
  return (
    <div className="space-y-3">
      {/* Tuỳ chọn Match Mode */}
      {showMatchMode && onChangeMatchMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs">
          <span className="font-medium text-[var(--dim)]">Sản phẩm phải khớp:</span>
          <div className="flex items-center rounded-lg border border-[var(--border)] bg-white p-0.5 font-semibold shadow-2xs">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChangeMatchMode("all")}
              className={`rounded-md px-3 py-1 transition-all ${
                matchMode === "all"
                  ? "bg-[var(--accent)] text-white shadow-2xs"
                  : "text-[var(--dim)] hover:text-[var(--text)]"
              }`}
            >
              Tất cả điều kiện (VÀ)
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChangeMatchMode("any")}
              className={`rounded-md px-3 py-1 transition-all ${
                matchMode === "any"
                  ? "bg-[var(--accent)] text-white shadow-2xs"
                  : "text-[var(--dim)] hover:text-[var(--text)]"
              }`}
            >
              Bất kỳ điều kiện nào (HOẶC)
            </button>
          </div>
        </div>
      )}

      {/* Danh sách các dòng điều kiện */}
      <div className="space-y-2">
        {conditions.map((c, i) => {
          const options = getConditionOptions(c.kind, catalog, allTags);
          const isDuplicate =
            i > 0 &&
            c.value.trim() !== "" &&
            conditions
              .slice(0, i)
              .some(
                (prev) =>
                  prev.kind === c.kind &&
                  prev.operator === c.operator &&
                  prev.value.trim().toLowerCase() === c.value.trim().toLowerCase(),
              );

          return (
            <div key={i} className="space-y-1.5">
              {i > 0 && (
                <div className="my-1.5 flex items-center justify-center">
                  <span className="rounded-full bg-[var(--sidebar)] px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[var(--dim)] uppercase">
                    {matchMode === "all" ? "VÀ" : "HOẶC"}
                  </span>
                </div>
              )}
              <ConditionRow
                condition={c}
                index={i}
                total={conditions.length}
                options={options}
                disabled={disabled}
                onChange={(patch) => onChangeCondition(i, patch)}
                onRemove={() => onRemoveCondition(i)}
              />
              {isDuplicate && (
                <div className="flex items-center gap-2 rounded-xl border border-[#f9ab00]/30 bg-[#fef7e0] px-3.5 py-2 text-xs font-medium text-[#b06000] shadow-2xs">
                  <span className="text-sm leading-none">⚠️</span>
                  <span>
                    Điều kiện này bị lặp lại với điều kiện phía trên — khi bấm <strong>Lưu</strong>, hệ thống sẽ tự động gộp thành 1 điều kiện duy nhất.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nút thêm điều kiện */}
      <div className="pt-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onAddCondition}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[var(--accent)] bg-[var(--accent-soft)]/60 px-4 py-2 text-xs font-semibold text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-white disabled:opacity-50"
        >
          <Icon d={ICONS.plus} size={13} />
          <span>{addLabel}</span>
        </button>
      </div>
    </div>
  );
}

