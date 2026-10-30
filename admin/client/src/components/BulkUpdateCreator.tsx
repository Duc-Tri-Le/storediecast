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
import type { BulkActionDraft, BulkActionType, BulkMode } from "./BulkUpdateForms";
import {
  bulkModesFor,
  BULK_ACTION_TYPE_LABELS,
  BULK_FIELD_ORDER,
  selectCls,
} from "./BulkUpdateForms";

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
  const setCondition = (i: number, patch: Partial<CollectionCondition>) =>
    setConditions((cs) =>
      cs.map((c, idx) => {
        if (idx !== i) return c;
        const next = { ...c, ...patch };
        if (patch.kind && patch.kind !== c.kind) next.value = "";
        return next;
      }),
    );

  const setBulkAction = (i: number, patch: Partial<BulkActionDraft>) =>
    setBulkActions((as) =>
      as.map((a, idx) => {
        if (idx !== i) return a;
        const next = { ...a, ...patch };
        if (patch.type && patch.type !== a.type) {
          const modes = bulkModesFor(patch.type);
          next.mode = modes[0]?.value ?? "set";
          next.value = "";
          next.text = "";
        }
        return next;
      }),
    );

  return (
    <>
      <section className={cardCls} aria-label="Điều kiện">
        <h2 className="text-base font-bold">Điều kiện</h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span>Sản phẩm phải khớp:</span>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="bu-match"
              checked={matchMode === "all"}
              onChange={() => setMatchMode("all")}
            />
            tất cả điều kiện
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="bu-match"
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

