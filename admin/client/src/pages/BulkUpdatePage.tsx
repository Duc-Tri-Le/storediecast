import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { CatalogData, Product } from "../types";
import type {
  CollectionCondition,
  MatchMode,
} from "../utils/collectionRules";
import {
  productMatchesConditions,
} from "../utils/collectionRules";
import { BackButton } from "../components/shared";
import type { BulkActionDraft } from "../components/BulkUpdateForms";
import { BulkUpdatePreviewModal } from "../components/BulkUpdateForms";
import { BulkUpdateCreatorForm } from "../components/BulkUpdateCreator";
import { BulkUpdateHistoryList } from "../components/BulkUpdateHistoryList";

export function BulkUpdatePage({
  products,
  loading,
  error,
  catalog: _catalog,
  routeIsNew = false,
  onNavigateCreating,
}: {
  products: Product[];
  loading: boolean;
  error: string | null;
  catalog: CatalogData | null;
  routeIsNew?: boolean;
  onNavigateCreating?: (creating: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "create">(() => (routeIsNew ? "create" : "list"));

  const handleSetView = (v: "list" | "create") => {
    setView(v);
    onNavigateCreating?.(v === "create");
  };

  const [notice, setNotice] = useState<string | null>(null);
  const PAGE_SIZE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  const updatesQuery = useQuery({
    queryKey: ["admin-bulk-updates"],
    queryFn: () => api.adminListBulkUpdates({}),
  });
  const updates = (updatesQuery.data?.updates ?? []) as any[];
  const totalPages = Math.max(1, Math.ceil(updates.length / PAGE_SIZE));

  const paginatedUpdates = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return updates.slice(start, start + PAGE_SIZE);
  }, [updates, currentPage, PAGE_SIZE]);

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
    mutationFn: () =>
      api.adminApplyBulkUpdate({
        matchMode,
        conditions: validConditions,
        variantMustMatch,
        actions: bulkActions.map((a) => {
          const numVal =
            a.mode === "clear"
              ? null
              : a.type === "description"
                ? null
                : Number(a.value);
          return {
            type: a.type,
            mode: a.mode,
            value: Number.isFinite(numVal) ? numVal : null,
            text: a.type === "description" ? a.text : undefined,
          };
        }),
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không áp dụng được cập nhật hàng loạt.");
        return;
      }
      setShowPreview(false);
      handleSetView("list");
      setNotice(
        `Đã cập nhật thành công ${res.updatedProducts} sản phẩm (${res.updatedVariants} biến thể) vào database chung.`,
      );
      void queryClient.invalidateQueries();
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const submit = () => {
    setFormError(null);
    if (validConditions.length === 0) {
      setFormError("Vui lòng thêm ít nhất một điều kiện lọc có giá trị.");
      return;
    }
    if (matchedProducts.length === 0) {
      setFormError("Không có sản phẩm nào khớp với điều kiện lọc hiện tại.");
      return;
    }
    for (let i = 0; i < bulkActions.length; i++) {
      const a = bulkActions[i]!;
      if (a.type === "description") {
        if (!a.text.trim()) {
          setFormError(`Hành động #${i + 1}: Vui lòng nhập nội dung mô tả mới.`);
          return;
        }
      } else if (a.mode !== "clear") {
        const n = Number(a.value);
        if (!a.value.trim() || Number.isNaN(n) || n < 0) {
          setFormError(`Hành động #${i + 1}: Vui lòng nhập số hợp lệ ≥ 0.`);
          return;
        }
      }
    }
    setShowPreview(true);
  };

  if (view === "create") {
    return (
      <div className="mx-auto max-w-4xl pb-12">
        <div className="mb-6">
          <BackButton label="Danh sách cập nhật" onClick={() => handleSetView("list")} />
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
            Tạo bản cập nhật hàng loạt
          </h1>
          <p className="mt-1 text-sm text-[var(--dim)]">
            Thiết lập điều kiện lọc và các hành động cần thay đổi cùng lúc trên nhiều sản phẩm
          </p>
        </div>

        {formError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#e3b3b3] bg-[#fdf3f3] p-4 text-sm text-[#9c2b2b]">
            <span className="text-base">⚠️</span>
            <p className="font-medium">{formError}</p>
          </div>
        )}

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
          onCancel={() => handleSetView("list")}
          onSubmit={submit}
          isPending={createMut.isPending}
        />

        {showPreview && (
          <BulkUpdatePreviewModal
            matchMode={matchMode}
            validConditions={validConditions}
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
    <BulkUpdateHistoryList
      updates={updates}
      paginatedUpdates={paginatedUpdates}
      loading={loading}
      error={error}
      notice={notice}
      setNotice={setNotice}
      onGoCreate={() => handleSetView("create")}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={PAGE_SIZE}
      onPageChange={setCurrentPage}
    />
  );
}
