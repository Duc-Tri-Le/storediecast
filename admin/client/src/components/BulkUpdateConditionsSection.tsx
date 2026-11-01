import type { Product } from "../types";
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
import { cardCls, inputCls, smallBtn } from "./shared";
import { selectCls, BULK_FIELD_ORDER } from "./BulkUpdateForms";

export interface BulkUpdateConditionsSectionProps {
  matchMode: MatchMode;
  setMatchMode: (m: MatchMode) => void;
  conditions: CollectionCondition[];
  setConditions: (
    cs: CollectionCondition[] | ((prev: CollectionCondition[]) => CollectionCondition[]),
  ) => void;
  variantMustMatch: boolean;
  setVariantMustMatch: (v: boolean | ((prev: boolean) => boolean)) => void;
  validConditions: CollectionCondition[];
  matchedProducts: Product[];
  matchedVariantCount: number;
}

export function BulkUpdateConditionsSection({
  matchMode,
  setMatchMode,
  conditions,
  setConditions,
  variantMustMatch,
  setVariantMustMatch,
  validConditions,
  matchedProducts,
  matchedVariantCount,
}: BulkUpdateConditionsSectionProps) {
  const setCondition = (i: number, patch: Partial<CollectionCondition>) =>
    setConditions((cs) =>
      cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    );

  return (
    <section className={cardCls} aria-label="Điều kiện">
      <h2 className="text-base font-bold">Điều kiện</h2>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="matchMode"
            checked={matchMode === "all"}
            onChange={() => setMatchMode("all")}
          />
          tất cả điều kiện
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="matchMode"
            checked={matchMode === "any"}
            onChange={() => setMatchMode("any")}
          />
          bất kỳ điều kiện nào
        </label>
      </div>
      <div className="mt-3 space-y-2">
        {conditions.map((c, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor={`bu-cond-field-${i}`}>
              Trường điều kiện {i + 1}
            </label>
            <select
              id={`bu-cond-field-${i}`}
              aria-label={`Trường điều kiện ${i + 1}`}
              className={`${selectCls} w-36 shrink-0`}
              value={c.kind}
              onChange={(e) =>
                setCondition(i, { kind: e.target.value as ConditionKind })
              }
            >
              {BULK_FIELD_ORDER.map((k) => (
                <option key={k} value={k}>
                  {CONDITION_KIND_LABELS[k]}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`bu-cond-op-${i}`}>
              Toán tử điều kiện {i + 1}
            </label>
            <select
              id={`bu-cond-op-${i}`}
              aria-label={`Toán tử điều kiện ${i + 1}`}
              className={`${selectCls} w-36 shrink-0`}
              value={c.operator}
              onChange={(e) =>
                setCondition(i, { operator: e.target.value as ConditionOperator })
              }
            >
              {(Object.keys(CONDITION_OPERATOR_LABELS_EN) as ConditionOperator[]).map(
                (o) => (
                  <option key={o} value={o}>
                    {CONDITION_OPERATOR_LABELS_EN[o]}
                  </option>
                ),
              )}
            </select>
            <label className="sr-only" htmlFor={`bu-cond-value-${i}`}>
              Giá trị điều kiện {i + 1}
            </label>
            <input
              id={`bu-cond-value-${i}`}
              type="text"
              aria-label={`Giá trị điều kiện ${i + 1}`}
              className={`${inputCls} min-w-40 flex-1`}
              value={c.value}
              onChange={(e) => setCondition(i, { value: e.target.value })}
              placeholder={
                c.kind === "tag"
                  ? "Ví dụ: Dài ~12 cm"
                  : `Nhập ${CONDITION_KIND_LABELS[c.kind].toLowerCase()}`
              }
            />
            <button
              type="button"
              aria-label={`Xóa điều kiện ${i + 1}`}
              disabled={conditions.length <= 1}
              onClick={() => setConditions((cs) => cs.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 text-sm text-[#9c2b2b] disabled:opacity-40"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          setConditions((cs) => [...cs, { kind: "brand", operator: "eq", value: "" }])
        }
        className={`${smallBtn} mt-3`}
      >
        Thêm điều kiện
      </button>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-3">
        <span className="text-sm font-medium tracking-wide text-[var(--dim)] uppercase">
          Biến thể phải khớp
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={variantMustMatch}
          aria-label="Biến thể phải khớp"
          onClick={() => setVariantMustMatch((s) => !s)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            variantMustMatch ? "bg-[var(--accent)]" : "bg-[#c3d3e6]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              variantMustMatch ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
        <span className="text-sm text-[var(--dim)]">
          {variantMustMatch
            ? "Bật: từng biến thể của sản phẩm khớp được kiểm tra lại theo đúng điều kiện."
            : "Tắt: mọi biến thể của sản phẩm khớp điều kiện đều được cập nhật."}
        </span>
      </div>
      <p className="mt-3 text-sm">
        {validConditions.length === 0
          ? "Nhập giá trị cho ít nhất một điều kiện để xem số sản phẩm khớp."
          : matchedProducts.length === 0
            ? "Không có sản phẩm nào khớp điều kiện này."
            : `Đang khớp ${matchedProducts.length} sản phẩm · ${matchedVariantCount} biến thể.`}
      </p>
    </section>
  );
}
