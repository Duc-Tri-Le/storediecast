import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { CatalogData, Product } from "../types";
import type {
  CollectionCondition,
  MatchMode,
} from "../utils/collectionRules";
import {
  productMatchesConditions,
} from "../utils/collectionRules";
import { fmtDate } from "../utils/format";
import { Icon, ICONS, smallBtn } from "../components/shared";
import type { BulkActionDraft } from "../components/BulkUpdateForms";
import {
  bulkActionLine,
  BulkUpdatePreviewModal,
} from "../components/BulkUpdateForms";
import { BulkUpdateCreatorForm } from "../components/BulkUpdateCreator";

export function BulkUpdatePage({
  products,
  loading,
  error,
}: {
  products: Product[];
  loading: boolean;
  error: string | null;
  catalog: CatalogData | null;
}) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "create">("list");
  const [notice, setNotice] = useState<string | null>(null);

  const updatesQuery = useQuery({
    queryKey: ["admin-bulk-updates"],
    queryFn: () => api.adminListBulkUpdates({}),
  });
  const updates = updatesQuery.data?.updates ?? [];

  const [matchMode, setMatchMode] = useState<MatchMode>("all");
  const [conditions, setConditions] = useState<CollectionCondition[]>([
    { kind: "brand", operator: "eq", value: "" },
  ]);
  const [variantMustMatch, setVariantMustMatch] = useState(false);
  const [bulkActions, setBulkActions] = useState<BulkActionDraft[]>([
    { type: "price", mode: "set", value: "", text: "" },
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const validConditions = useMemo(
    () => conditions.filter((c) => c.value.trim()),
    [conditions],
  );

  const matchedProducts = useMemo(() => {
    if (validConditions.length === 0) return [];
    return products.filter((p) =>
      productMatchesConditions(p, validConditions, matchMode),
    );
  }, [products, validConditions, matchMode]);

  const matchedVariantCount = useMemo(() => {
    if (!variantMustMatch) {
      return matchedProducts.reduce((s, p) => s + p.variants.length, 0);
    }
    let count = 0;
    for (const p of matchedProducts) {
      for (const v of p.variants) {
        const fakeProduct: Product = { ...p, variants: [v] };
        if (productMatchesConditions(fakeProduct, validConditions, matchMode)) {
          count++;
        }
      }
    }
    return count;
  }, [matchedProducts, variantMustMatch, validConditions, matchMode]);

  const createMut = useMutation({
    mutationFn: () => {
      const actions = bulkActions.map((a) => {
        const val =
          a.mode === "clear"
            ? null
            : a.type === "description"
              ? null
              : Number(a.value.replace(/[^\d.-]/g, "") || "0");
        return {
          type: a.type,
          mode: a.mode,
          value: val,
          text: a.type === "description" ? a.text : undefined,
        };
      });
      return api.adminApplyBulkUpdate({
        conditions: validConditions,
        matchMode,
        variantMustMatch,
        actions,
      });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không thực hiện được cập nhật.");
        return;
      }
      queryClient.invalidateQueries();
      setView("list");
      setFormError(null);
      setNotice(
        `Đã cập nhật ${res.updatedProducts} sản phẩm (${res.updatedVariants} biến thể) vào database chung.`,
      );
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const submit = () => {
    setFormError(null);
    if (validConditions.length === 0) {
      return setFormError("Cần ít nhất một điều kiện có giá trị.");
    }
    if (matchedProducts.length === 0) {
      return setFormError("Không có sản phẩm nào khớp điều kiện để cập nhật.");
    }
    for (let i = 0; i < bulkActions.length; i++) {
      const a = bulkActions[i];
      if (!a) continue;
      if (a.type === "description") {
        if (!a.text.trim()) {
          return setFormError(`Hành động ${i + 1} (mô tả): chưa nhập nội dung mô tả.`);
        }
      } else if (a.mode !== "clear") {
        const n = Number(a.value.replace(/[^\d.-]/g, ""));
        if (!a.value.trim() || isNaN(n) || n <= 0) {
          return setFormError(
            `Hành động ${i + 1}: giá trị phải là số lớn hơn 0 (ví dụ 10% hoặc 450000₫).`,
          );
        }
      }
    }
    createMut.mutate();
  };

  if (view === "create") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setView("list")}
          aria-label="Quay lại Cập nhật hàng loạt"
          className="inline-flex items-center gap-1 rounded-md bg-[var(--sidebar)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--dim)] uppercase hover:text-[var(--text)]"
        >
          ‹ Cập nhật hàng loạt
        </button>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="mr-auto text-2xl font-bold tracking-tight">Tạo bản cập nhật</h1>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`${smallBtn} inline-flex items-center gap-1.5`}
          >
            <Icon
              d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"
              size={16}
            />
            Xem trước
          </button>
        </div>

        {formError && (
          <p className="mt-4 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
            {formError}
          </p>
        )}

        <div className="mt-4">
          <BulkUpdateCreatorForm
            matchMode={matchMode}
            setMatchMode={setMatchMode}
            conditions={conditions}
            setConditions={setConditions}
            variantMustMatch={variantMustMatch}
            setVariantMustMatch={setVariantMustMatch}
            validConditions={validConditions}
            matchedProducts={matchedProducts}
            matchedVariantCount={matchedVariantCount}
            bulkActions={bulkActions}
            setBulkActions={setBulkActions}
            onCancel={() => setView("list")}
            onSubmit={submit}
            isPending={createMut.isPending}
          />
        </div>

        {showPreview && (
          <BulkUpdatePreviewModal
            validConditions={validConditions}
            matchMode={matchMode}
            variantMustMatch={variantMustMatch}
            bulkActions={bulkActions}
            matchedProducts={matchedProducts}
            matchedVariantCount={matchedVariantCount}
            onApply={() => createMut.mutate()}
            onClose={() => setShowPreview(false)}
            isPending={createMut.isPending}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold tracking-tight">Cập nhật hàng loạt</h1>
        <button
          type="button"
          onClick={() => setView("create")}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
        >
          <Icon d={ICONS.plus} size={15} /> Tạo bản cập nhật
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--dim)]">
        Đổi giá, khuyến mãi, tồn kho hoặc mô tả cho nhiều sản phẩm cùng lúc theo điều kiện.
      </p>

      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">{notice}</p>
      )}
      {loading && <p className="mt-6 text-sm text-[var(--dim)]">Đang tải…</p>}
      {error && (
        <p className="mt-6 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          {error}
        </p>
      )}

      {!loading && !error && updates.length === 0 && (
        <div className="mt-8 rounded-xl border border-[var(--border)] p-8 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--dim)]">Chưa có bản cập nhật hàng loạt nào.</p>
          <button
            type="button"
            onClick={() => setView("create")}
            className="mt-3 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
          >
            Tạo bản cập nhật đầu tiên
          </button>
        </div>
      )}

      {updates.length > 0 && (
        <div className="mt-5 space-y-3">
          {updates.map((u) => (
            <div
              key={u.id}
              className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">Cập nhật #{u.id}</p>
                  <p className="text-xs text-[var(--dim)]">{fmtDate(u.createdAt)}</p>
                </div>
                <span className="rounded bg-[var(--sidebar)] px-2.5 py-1 text-xs font-medium">
                  {u.updatedProducts} sản phẩm · {u.updatedVariants} biến thể
                </span>
              </div>
              <div className="mt-3 text-xs text-[var(--dim)]">
                <p>
                  Hành động:{" "}
                  {u.actions
                    .map((a) =>
                      bulkActionLine({
                        type: a.type,
                        mode: a.mode,
                        value: a.value,
                        text: a.text,
                      }),
                    )
                    .join("; ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
