import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Product, ShopCollection, CatalogData, Order } from "../types";
import type {
  CollectionRow,
  CollectionKind,
  CollectionStatus,
  CollectionCondition,
  MatchMode,
} from "../utils/collectionRules";
import {
  conditionLine,
  productMatchesConditions,
  minPriceOf,
} from "../utils/collectionRules";
import { totalStock } from "../utils/format";

export function useCollectionsData({
  products,
  collections,
  catalog,
  orders,
}: {
  products: Product[];
  collections: ShopCollection[];
  catalog: CatalogData | null;
  orders: Order[];
}) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | CollectionKind>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("best");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<ReadonlySet<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const updateMut = useMutation({
    mutationFn: (c: ShopCollection & { nextStatus: CollectionStatus }) =>
      api.adminUpdateCollection({ id: c.id, title: c.title, status: c.nextStatus }),
    onSuccess: (res, c) => {
      if (!res.ok) {
        setNotice(res.error ?? "Không đổi được trạng thái bộ sưu tập.");
        return;
      }
      setNotice(
        c.nextStatus === "published"
          ? `Đã đăng bộ sưu tập “${c.title}”.`
          : `Đã chuyển bộ sưu tập “${c.title}” về Nháp.`,
      );
      queryClient.invalidateQueries();
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : String(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (c: ShopCollection) =>
      api.adminDeleteCollection({ collectionId: c.id }),
    onSuccess: (res, c) => {
      if (!res.ok) {
        setNotice(res.error ?? "Không xóa được bộ sưu tập.");
        return;
      }
      setConfirmDeleteId(null);
      if (selectedId === `custom-${c.id}`) setSelectedId(null);
      setNotice(
        `Đã xóa bộ sưu tập “${c.title}” khỏi database chung — thẻ tag của bộ này cũng biến mất khỏi các sản phẩm.`,
      );
      queryClient.invalidateQueries();
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : String(e)),
  });

  const bulkDeleteMut = useMutation({
    mutationFn: (ids: number[]) =>
      api.adminDeleteCollectionsBulk({ collectionIds: ids }),
    onSuccess: (res, ids) => {
      setConfirmBulkDelete(false);
      if (res.ok) {
        setSelectedRowIds(new Set());
        const deletedRowIds = new Set(ids.map((id) => `custom-${id}`));
        if (selectedId != null && deletedRowIds.has(selectedId)) setSelectedId(null);
        setNotice(
          `Đã xóa ${res.deleted} bộ sưu tập tự tạo khỏi database chung — sản phẩm trong các bộ vẫn giữ nguyên, chỉ thẻ tag của bộ đã xóa biến mất khỏi chúng.`,
        );
        queryClient.invalidateQueries();
      } else {
        setNotice(res.error ?? "Không xóa được các bộ sưu tập đã chọn.");
      }
    },
    onError: (e) => {
      setConfirmBulkDelete(false);
      setNotice(e instanceof Error ? e.message : String(e));
    },
  });

  const soldByProduct = useMemo(() => {
    const map = new Map<number, number>();
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      for (const it of o.items) {
        map.set(it.productId, (map.get(it.productId) ?? 0) + it.quantity);
      }
    }
    return map;
  }, [orders]);

  const allRows = useMemo<CollectionRow[]>(() => {
    const buildStats = (matched: Product[]) => ({
      count: matched.length,
      stock: matched.reduce((s, p) => s + totalStock(p), 0),
      fromPrice: minPriceOf(matched),
      soldQty: matched.reduce((s, p) => s + (soldByProduct.get(p.id) ?? 0), 0),
      matched,
    });

    const catalogScales = catalog
      ? catalog.scales.map((s) => s.name)
      : [...new Set(products.map((p) => p.scale))];

    const baseRows: CollectionRow[] = catalogScales.map((scale) => {
      const baseCol = collections.find((c) => c.baseScale === scale) ?? null;
      const baseConditions = (
        baseCol && (baseCol.conditions as CollectionCondition[]).length > 0
          ? (baseCol.conditions as CollectionCondition[])
          : [{ kind: "scale" as const, operator: "eq" as const, value: scale }]
      ) as CollectionCondition[];
      const baseKind: CollectionKind = baseCol?.kind === "manual" ? "manual" : "auto";
      const baseMatchMode: MatchMode = baseCol?.matchMode === "all" ? "all" : "any";
      const matched =
        baseCol == null
          ? products.filter((p) => p.scale === scale)
          : baseKind === "manual"
            ? baseCol.productIds
                .map((pid) => products.find((p) => p.id === pid))
                .filter((p): p is Product => p != null)
            : products.filter((p) =>
                productMatchesConditions(p, baseConditions, baseMatchMode),
              );
      return {
        id: `base-scale-${scale}`,
        title: baseCol?.title ?? `Mô hình tỉ lệ ${scale}`,
        kind: baseKind,
        status:
          baseCol?.status === "draft" ? ("draft" as const) : ("published" as const),
        createdAt: baseCol?.createdAt ?? "",
        conditions: baseConditions,
        matchMode: baseCol ? baseMatchMode : ("all" as const),
        lines: baseKind === "manual" ? [] : baseConditions.map(conditionLine),
        moreUnit: "điều kiện",
        ...buildStats(matched),
        isBase: true,
        nav: { kind: "scale" as const, value: scale },
        custom: baseCol,
      };
    });

    const customRows: CollectionRow[] = collections
      .filter((c) => c.baseScale == null)
      .map((c) => {
        if (c.kind === "auto") {
          const conditions = c.conditions as CollectionCondition[];
          const matched = products.filter((p) =>
            productMatchesConditions(p, conditions, c.matchMode),
          );
          const single = conditions.length === 1 ? conditions[0] : undefined;
          return {
            id: `custom-${c.id}`,
            title: c.title,
            kind: "auto" as const,
            status:
              c.status === "published" ? ("published" as const) : ("draft" as const),
            createdAt: c.createdAt,
            conditions,
            matchMode: (c.matchMode === "all" ? "all" : "any") as MatchMode,
            lines: conditions.map(conditionLine),
            moreUnit: "điều kiện",
            ...buildStats(matched),
            isBase: false,
            nav:
              single && single.kind === "scale"
                ? { kind: "scale" as const, value: single.value }
                : single && single.kind === "brand"
                  ? { kind: "brand" as const, value: single.value }
                  : single && single.kind === "vehicleType"
                    ? { kind: "vehicleType" as const, value: single.value }
                    : null,
            custom: c,
          };
        }
        const matched = c.productIds
          .map((pid) => products.find((p) => p.id === pid))
          .filter((p): p is Product => p != null);
        return {
          id: `custom-${c.id}`,
          title: c.title,
          kind: "manual" as const,
          status:
            c.status === "published" ? ("published" as const) : ("draft" as const),
          createdAt: c.createdAt,
          conditions: c.conditions as CollectionCondition[],
          matchMode: (c.matchMode === "all" ? "all" : "any") as MatchMode,
          lines: [],
          moreUnit: "sản phẩm",
          ...buildStats(matched),
          isBase: false,
          nav: null,
          custom: c,
        };
      });

    return [...baseRows, ...customRows];
  }, [products, collections, soldByProduct, catalog]);

  const counts = useMemo(
    () => ({
      all: allRows.length,
      manual: allRows.filter((r) => r.kind === "manual").length,
      auto: allRows.filter((r) => r.kind === "auto").length,
    }),
    [allRows],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = allRows.filter((r) => {
      if (tab !== "all" && r.kind !== tab) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.lines.some((l) => l.toLowerCase().includes(q))
      );
    });
    const sorted = [...filtered];
    switch (sort) {
      case "nameAsc":
        sorted.sort((a, b) => a.title.localeCompare(b.title, "vi"));
        break;
      case "nameDesc":
        sorted.sort((a, b) => b.title.localeCompare(a.title, "vi"));
        break;
      case "countDesc":
        sorted.sort((a, b) => b.count - a.count);
        break;
      case "stockDesc":
        sorted.sort((a, b) => b.stock - a.stock);
        break;
      case "createdDesc":
        sorted.sort(
          (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
        );
        break;
      case "createdAsc":
        sorted.sort(
          (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
        );
        break;
      default:
        sorted.sort((a, b) => b.soldQty - a.soldQty || b.count - a.count);
    }
    return sorted;
  }, [allRows, tab, search, sort]);

  const selectedCollectionRows = allRows.filter(
    (r) => r.custom != null && !r.isBase && selectedRowIds.has(r.id),
  );
  const deletableVisible = visible.filter((r) => r.custom != null && !r.isBase);
  const allDeletableVisibleSelected =
    deletableVisible.length > 0 &&
    deletableVisible.every((r) => selectedRowIds.has(r.id));

  const toggleCollectionSelected = (row: CollectionRow, checked: boolean) => {
    if (!row.custom || row.isBase) return;
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(row.id);
      else next.delete(row.id);
      return next;
    });
  };

  const toggleSelectAllCollections = (checked: boolean) =>
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (checked) for (const r of deletableVisible) next.add(r.id);
      else for (const r of deletableVisible) next.delete(r.id);
      return next;
    });

  const selectedRow =
    selectedId != null ? (allRows.find((r) => r.id === selectedId) ?? null) : null;

  const toggleStatus = (row: CollectionRow) => {
    if (!row.custom || updateMut.isPending) return;
    const nextStatus: CollectionStatus =
      row.custom.status === "published" ? "draft" : "published";
    updateMut.mutate({ ...row.custom, nextStatus });
  };

  const deleteCustom = (row: CollectionRow) => {
    if (!row.custom || deleteMut.isPending) return;
    deleteMut.mutate(row.custom);
  };

  return {
    tab,
    setTab,
    search,
    setSearch,
    sort,
    setSort,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedRowIds,
    setSelectedRowIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    notice,
    setNotice,
    allRows,
    counts,
    visible,
    selectedCollectionRows,
    deletableVisible,
    allDeletableVisibleSelected,
    toggleCollectionSelected,
    toggleSelectAllCollections,
    selectedRow,
    toggleStatus,
    deleteCustom,
    bulkDeleteMut,
  };
}

