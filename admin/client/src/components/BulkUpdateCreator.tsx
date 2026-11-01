import type { Product } from "../types";
import type {
  CollectionCondition,
  MatchMode,
} from "../utils/collectionRules";
import { cardCls, inputCls, smallBtn } from "./shared";
import type { BulkActionDraft, BulkActionType, BulkMode } from "./BulkUpdateForms";
import {
  bulkModesFor,
  BULK_ACTION_TYPE_LABELS,
  selectCls,
} from "./BulkUpdateForms";
import { BulkUpdateConditionsSection } from "./BulkUpdateConditionsSection";

export function BulkUpdateCreatorForm({
  matchMode,
  setMatchMode,
  conditions,
  setConditions,
  variantMustMatch,
  setVariantMustMatch,
  validConditions,
  matchedProducts,
  matchedVariantCount,
  bulkActions,
  setBulkActions,
  onCancel,
  onSubmit,
  isPending,
}: {
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
  bulkActions: BulkActionDraft[];
  setBulkActions: (
    as: BulkActionDraft[] | ((prev: BulkActionDraft[]) => BulkActionDraft[]),
  ) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  const setBulkAction = (i: number, patch: Partial<BulkActionDraft>) =>
    setBulkActions((as) =>
      as.map((a, idx) => {
        if (idx !== i) return a;
        const next = { ...a, ...patch };
        if (patch.type && patch.type !== a.type) {
          next.mode = bulkModesFor(patch.type)[0]?.value ?? "set";
          next.value = "";
          next.text = "";
        }
        return next;
      }),
    );

  return (
    <>
      <BulkUpdateConditionsSection
        matchMode={matchMode}
        setMatchMode={setMatchMode}
        conditions={conditions}
        setConditions={setConditions}
        variantMustMatch={variantMustMatch}
        setVariantMustMatch={setVariantMustMatch}
        validConditions={validConditions}
        matchedProducts={matchedProducts}
        matchedVariantCount={matchedVariantCount}
      />

      <section className={`${cardCls} mt-4`} aria-label="Hành động">
        <h2 className="text-base font-bold">Hành động</h2>
        <div className="mt-3 space-y-3">
          {bulkActions.map((a, i) => (
            <div key={i} className="flex flex-wrap items-start gap-2">
              <label className="sr-only" htmlFor={`bu-act-type-${i}`}>
                Loại hành động {i + 1}
              </label>
              <select
                id={`bu-act-type-${i}`}
                aria-label={`Loại hành động ${i + 1}`}
                className={`${selectCls} w-44 shrink-0`}
                value={a.type}
                onChange={(e) =>
                  setBulkAction(i, { type: e.target.value as BulkActionType })
                }
              >
                {(Object.keys(BULK_ACTION_TYPE_LABELS) as BulkActionType[]).map((t) => (
                  <option key={t} value={t}>
                    {BULK_ACTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              {a.type === "description" ? (
                <>
                  <label className="sr-only" htmlFor={`bu-act-text-${i}`}>
                    Mô tả mới {i + 1}
                  </label>
                  <textarea
                    id={`bu-act-text-${i}`}
                    aria-label={`Mô tả mới ${i + 1}`}
                    className={`${inputCls} min-w-52 flex-1`}
                    rows={3}
                    value={a.text}
                    onChange={(e) => setBulkAction(i, { text: e.target.value })}
                    placeholder="Mô tả mới áp cho mọi sản phẩm khớp điều kiện"
                  />
                </>
              ) : (
                <>
                  <label className="sr-only" htmlFor={`bu-act-mode-${i}`}>
                    Cách áp dụng hành động {i + 1}
                  </label>
                  <select
                    id={`bu-act-mode-${i}`}
                    aria-label={`Cách áp dụng hành động ${i + 1}`}
                    className={`${selectCls} w-44 shrink-0`}
                    value={a.mode}
                    onChange={(e) => setBulkAction(i, { mode: e.target.value as BulkMode })}
                  >
                    {bulkModesFor(a.type).map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  {a.mode !== "clear" && (
                    <>
                      <label className="sr-only" htmlFor={`bu-act-value-${i}`}>
                        Giá trị hành động {i + 1}
                      </label>
                      <input
                        id={`bu-act-value-${i}`}
                        aria-label={`Giá trị hành động ${i + 1}`}
                        className={`${inputCls} w-40 shrink-0`}
                        inputMode="decimal"
                        value={a.value}
                        onChange={(e) => setBulkAction(i, { value: e.target.value })}
                        placeholder={
                          a.mode === "percentAdd" || a.mode === "percentSubtract"
                            ? "Ví dụ: 10 (%)"
                            : a.type === "stock"
                              ? "Ví dụ: 5 (chiếc)"
                              : "Ví dụ: 450000 (₫)"
                        }
                      />
                    </>
                  )}
                </>
              )}
              <button
                type="button"
                aria-label={`Xóa hành động ${i + 1}`}
                disabled={bulkActions.length <= 1}
                onClick={() => setBulkActions((as) => as.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 py-2 text-sm text-[#9c2b2b] disabled:opacity-40"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setBulkActions((as) => [
              ...as,
              { type: "price", mode: "set", value: "", text: "" },
            ])
          }
          className={`${smallBtn} mt-3`}
        >
          Thêm hành động khác
        </button>
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onCancel} className={smallBtn}>
          Hủy
        </button>
        <span className="flex-1" />
        <button
          type="button"
          disabled={isPending}
          onClick={onSubmit}
          className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] disabled:opacity-50"
        >
          {isPending ? "Đang cập nhật…" : "Cập nhật sản phẩm"}
        </button>
      </div>
    </>
  );
}
