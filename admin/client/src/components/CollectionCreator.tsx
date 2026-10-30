import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Product, CatalogData } from "../types";
import type {
  CollectionKind,
  CollectionStatus,
  CollectionCondition,
  ConditionKind,
  ConditionOperator,
  MatchMode,
} from "../utils/collectionRules";
import {
  CONDITION_KIND_LABELS,
  CONDITION_OPERATOR_LABELS,
  productMatchesConditions,
  productTags,
} from "../utils/collectionRules";
import { totalStock } from "../utils/format";
import { labelCls, inputCls } from "./shared";

export function CollectionCreator({
  products,
  catalog,
  onClose,
  onCreated,
}: {
  products: Product[];
  catalog: CatalogData | null;
  onClose: () => void;
  onCreated: (c: { id: number; title: string; status: CollectionStatus }) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<CollectionStatus>("draft");
  const [mode, setMode] = useState<CollectionKind>("manual");
  const [pickedIds, setPickedIds] = useState<number[]>([]);
  const [pickSearch, setPickSearch] = useState("");
  const [conditions, setConditions] = useState<CollectionCondition[]>([
    { kind: "scale", operator: "eq", value: "" },
  ]);
  const [matchMode, setMatchMode] = useState<MatchMode>("any");
  const [formError, setFormError] = useState<string | null>(null);

  const pickable = useMemo(() => {
    const q = pickSearch.trim().toLowerCase();
    return products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.scale.includes(q),
    );
  }, [products, pickSearch]);

  const conditionOptions = (kind: ConditionKind): string[] => {
    if (kind === "tag")
      return [...new Set(products.flatMap((p) => productTags(p)))].sort((a, b) =>
        a.localeCompare(b, "vi"),
      );
    if (!catalog) return [];
    if (kind === "scale") return catalog.scales.map((e) => e.name);
    if (kind === "brand") return catalog.carBrands.map((e) => e.name);
    if (kind === "vehicleType") return catalog.vehicleTypes.map((e) => e.name);
    return catalog.modelMakers.map((e) => e.name);
  };

  const validConditions = conditions.filter((c) => c.value.trim());
  const autoMatchCount =
    mode === "auto" && validConditions.length > 0
      ? products.filter((p) => productMatchesConditions(p, validConditions, matchMode))
          .length
      : 0;

  const setCondition = (i: number, patch: Partial<CollectionCondition>) =>
    setConditions((cs) =>
      cs.map((c, idx) => {
        if (idx !== i) return c;
        const next = { ...c, ...patch };
        if (patch.kind && patch.kind !== c.kind) next.value = "";
        return next;
      }),
    );

  const createMut = useMutation({
    mutationFn: () =>
      api.adminCreateCollection({
        title: title.trim(),
        status,
        kind: mode,
        conditions: mode === "auto" ? validConditions : [],
        productIds: mode === "manual" ? pickedIds : [],
        matchMode,
      }),
    onSuccess: (res) => {
      if (!res.ok || res.collectionId == null) {
        setFormError(res.error ?? "Không tạo được bộ sưu tập.");
        return;
      }
      queryClient.invalidateQueries();
      onCreated({ id: res.collectionId, title: title.trim(), status });
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const submit = () => {
    if (title.trim().length < 2)
      return setFormError("Tên bộ sưu tập cần ít nhất 2 ký tự.");
    if (mode === "auto" && validConditions.length === 0)
      return setFormError(
        "Bộ sưu tập tự động cần ít nhất một điều kiện — chọn loại điều kiện và giá trị từ danh mục.",
      );
    setFormError(null);
    createMut.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tạo bộ sưu tập"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)] sm:rounded-2xl">
        <h2 className="text-lg font-bold">Tạo bộ sưu tập</h2>
        <p className="mt-1 text-sm text-[var(--dim)]">
          Bộ sưu tập được lưu vào database chung với web bán hàng. Bộ thủ công thì tự
          chọn từng sản phẩm; bộ tự động thì gom sản phẩm theo điều kiện lấy từ Quản lý
          danh mục. Sản phẩm trong bộ sẽ hiện thẻ tag tên bộ này ở trang chi tiết của nó.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className={labelCls} htmlFor="cc-title">
              Tên bộ sưu tập
            </label>
            <input
              id="cc-title"
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: BMW trưng bày, Xe máy cổ…"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="cc-status">
              Trạng thái
            </label>
            <select
              id="cc-status"
              className={inputCls}
              value={status}
              onChange={(e) => setStatus(e.target.value as CollectionStatus)}
            >
              <option value="draft">Nháp</option>
              <option value="published">Đã đăng</option>
            </select>
          </div>
          <div>
            <span className={labelCls}>Cách gom sản phẩm</span>
            <div
              className="flex gap-2"
              role="group"
              aria-label="Cách gom sản phẩm vào bộ sưu tập"
            >
              <button
                type="button"
                aria-pressed={mode === "manual"}
                onClick={() => setMode("manual")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  mode === "manual"
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                    : "border-[var(--border)]"
                }`}
              >
                Thủ công — chọn từng sản phẩm
              </button>
              <button
                type="button"
                aria-pressed={mode === "auto"}
                onClick={() => setMode("auto")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                  mode === "auto"
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                    : "border-[var(--border)]"
                }`}
              >
                Tự động — theo điều kiện
              </button>
            </div>
          </div>
          {mode === "auto" && (
            <div>
              <span className={labelCls}>Điều kiện của bộ</span>
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span>Sản phẩm phải khớp:</span>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="cc-match"
                    checked={matchMode === "all"}
                    onChange={() => setMatchMode("all")}
                  />
                  tất cả điều kiện
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="cc-match"
                    checked={matchMode === "any"}
                    onChange={() => setMatchMode("any")}
                  />
                  bất kỳ điều kiện nào
                </label>
              </div>
              <div className="space-y-2">
                {conditions.map((c, i) => (
                  <div key={i} className="flex flex-wrap gap-2">
                    <label className="sr-only" htmlFor={`cc-cond-kind-${i}`}>
                      Loại điều kiện {i + 1}
                    </label>
                    <select
                      id={`cc-cond-kind-${i}`}
                      className="w-32 shrink-0 rounded-lg border border-[var(--border)] px-2 py-2 text-sm outline-none focus:border-[var(--accent)]"
                      value={c.kind}
                      onChange={(e) =>
                        setCondition(i, { kind: e.target.value as ConditionKind })
                      }
                    >
                      {(Object.keys(CONDITION_KIND_LABELS) as ConditionKind[]).map(
                        (k) => (
                          <option key={k} value={k}>
                            {CONDITION_KIND_LABELS[k]}
                          </option>
                        ),
                      )}
                    </select>
                    <label className="sr-only" htmlFor={`cc-cond-op-${i}`}>
                      Toán tử điều kiện {i + 1}
                    </label>
                    <select
                      id={`cc-cond-op-${i}`}
                      aria-label={`Toán tử điều kiện ${i + 1}`}
                      className="w-28 shrink-0 rounded-lg border border-[var(--border)] px-2 py-2 text-sm outline-none focus:border-[var(--accent)]"
                      value={c.operator}
                      onChange={(e) =>
                        setCondition(i, { operator: e.target.value as ConditionOperator })
                      }
                    >
                      {(
                        Object.keys(CONDITION_OPERATOR_LABELS) as ConditionOperator[]
                      ).map((o) => (
                        <option key={o} value={o}>
                          {CONDITION_OPERATOR_LABELS[o]}
                        </option>
                      ))}
                    </select>
                    <label className="sr-only" htmlFor={`cc-cond-value-${i}`}>
                      Giá trị điều kiện {i + 1}
                    </label>
                    <select
                      id={`cc-cond-value-${i}`}
                      className="min-w-0 flex-1 rounded-lg border border-[var(--border)] px-2 py-2 text-sm outline-none focus:border-[var(--accent)]"
                      value={c.value}
                      onChange={(e) => setCondition(i, { value: e.target.value })}
                    >
                      <option value="">
                        — Chọn {CONDITION_KIND_LABELS[c.kind].toLowerCase()} —
                      </option>
                      {conditionOptions(c.kind).map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      aria-label={`Xóa điều kiện ${i + 1}`}
                      disabled={conditions.length <= 1}
                      onClick={() =>
                        setConditions((cs) => cs.filter((_, idx) => idx !== i))
                      }
                      className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 text-sm text-[#9c2b2b] disabled:opacity-40"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setConditions((cs) => [
                      ...cs,
                      { kind: "brand", operator: "eq", value: "" },
                    ])
                  }
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium"
                >
                  + Thêm điều kiện
                </button>
                <p className="text-sm text-[var(--dim)]">
                  {validConditions.length > 0
                    ? `Đang khớp ${autoMatchCount} sản phẩm`
                    : "Chưa chọn giá trị điều kiện nào"}
                </p>
              </div>
              <p className="mt-1 text-xs text-[var(--dim)]">
                Giá trị điều kiện lấy đúng từ Quản lý danh mục — thêm mục mới ở trang danh
                mục là chọn được ở đây ngay.
              </p>
            </div>
          )}
          {mode === "manual" && (
            <div>
              <p className={labelCls}>
                Chọn sản phẩm đưa vào bộ ngay ({pickedIds.length} đã chọn) — để trống cũng
                được, thêm sau trong chi tiết bộ
              </p>
              <input
                type="search"
                value={pickSearch}
                onChange={(e) => setPickSearch(e.target.value)}
                placeholder="Tìm sản phẩm để chọn"
                aria-label="Tìm sản phẩm để đưa vào bộ sưu tập"
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
                {pickable.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--sidebar)]"
                  >
                    <input
                      type="checkbox"
                      checked={pickedIds.includes(p.id)}
                      onChange={(e) =>
                        setPickedIds((ids) =>
                          e.target.checked
                            ? [...ids, p.id]
                            : ids.filter((x) => x !== p.id),
                        )
                      }
                      className="h-4 w-4"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block text-xs text-[var(--dim)]">
                        {p.brand} · Tỉ lệ {p.scale} · {p.vehicleType} · Tồn {totalStock(p)}
                      </span>
                    </span>
                  </label>
                ))}
                {pickable.length === 0 && (
                  <p className="px-2 py-3 text-sm text-[var(--dim)]">
                    Không có sản phẩm nào khớp.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        {formError && (
          <p className="mt-4 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
            {formError}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={createMut.isPending}
            onClick={submit}
            className="flex-1 rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {createMut.isPending ? "Đang tạo…" : "Tạo bộ sưu tập"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

