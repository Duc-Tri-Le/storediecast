import { useState, useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Product, ShopCollection } from "../types";
import type {
  CollectionKind,
  CollectionStatus,
  CollectionCondition,
  MatchMode,
} from "../utils/collectionRules";
import { productMatchesConditions, productTags } from "../utils/collectionRules";
import { processImageFile } from "../utils/productFormTypes";
import type { CollectionSortKey } from "../components/CollectionProductList";
import {
  type CollectionFormShape,
  shapeOfCollectionForm,
  sortCollectionProducts,
} from "../utils/collectionFormHelpers";

export function useCollectionDetailForm({
  collection,
  products,
  onDeleted,
}: {
  collection: ShopCollection;
  products: Product[];
  onDeleted: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description);
  const [descPreview, setDescPreview] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [conditions, setConditions] = useState<CollectionCondition[]>(
    (collection.conditions as CollectionCondition[]).length > 0
      ? (collection.conditions as CollectionCondition[])
      : [{ kind: "scale", operator: "eq", value: "" }],
  );
  const [matchMode, setMatchMode] = useState<MatchMode>(
    collection.matchMode === "all" ? "all" : "any",
  );
  const [mode, setMode] = useState<CollectionKind>(
    collection.kind === "auto" ? "auto" : "manual",
  );
  const [manualIds, setManualIds] = useState<number[]>(collection.productIds);
  const [visibleOnList, setVisibleOnList] = useState(collection.visible);
  const [imageKey, setImageKey] = useState(collection.imageKey);
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState(collection.seoTitle);
  const [seoDescription, setSeoDescription] = useState(collection.seoDescription);
  const [status, setStatus] = useState<CollectionStatus>(
    collection.status === "published" ? "published" : "draft",
  );
  const [sortKey, setSortKey] = useState<CollectionSortKey>("manual");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [savedSnapshot, setSavedSnapshot] = useState<string>(() =>
    shapeOfCollectionForm({
      title: collection.title,
      description: collection.description,
      conditions:
        (collection.conditions as CollectionCondition[]).length > 0
          ? (collection.conditions as CollectionCondition[])
          : [{ kind: "scale", operator: "eq", value: "" }],
      matchMode: collection.matchMode === "all" ? "all" : "any",
      mode: collection.kind === "auto" ? "auto" : "manual",
      manualIds: collection.productIds,
      sortKey: "manual",
      status: collection.status === "published" ? "published" : "draft",
      visibleOnList: collection.visible,
      imageKey: collection.imageKey,
      seoTitle: collection.seoTitle,
      seoDescription: collection.seoDescription,
    }),
  );

  const currentCollectionShape = (): CollectionFormShape => ({
    title,
    description,
    conditions,
    matchMode,
    mode,
    manualIds,
    sortKey,
    status,
    visibleOnList,
    imageKey,
    seoTitle,
    seoDescription,
  });

  const isDirty = shapeOfCollectionForm(currentCollectionShape()) !== savedSnapshot;

  const discardChanges = () => {
    let saved: CollectionFormShape;
    try {
      saved = JSON.parse(savedSnapshot) as CollectionFormShape;
    } catch {
      return;
    }
    setTitle(saved.title);
    setDescription(saved.description);
    setConditions(saved.conditions);
    setMatchMode(saved.matchMode);
    setMode(saved.mode);
    setManualIds(saved.manualIds);
    setSortKey(saved.sortKey);
    setStatus(saved.status);
    setVisibleOnList(saved.visibleOnList);
    setImageKey(saved.imageKey);
    setImageName("");
    setImageError(null);
    setSeoTitle(saved.seoTitle);
    setSeoDescription(saved.seoDescription);
    setFormError(null);
    setNotice(null);
  };

  const allTags = useMemo(
    () =>
      [...new Set(products.flatMap((p) => productTags(p)))].sort((a, b) =>
        a.localeCompare(b, "vi"),
      ),
    [products],
  );

  const validConditions = useMemo(
    () => conditions.filter((c) => c.value.trim()),
    [conditions],
  );

  const autoMatched = useMemo(
    () =>
      validConditions.length > 0
        ? products.filter((p) => productMatchesConditions(p, validConditions, matchMode))
        : [],
    [products, validConditions, matchMode],
  );

  const displayedProducts = useMemo(
    () =>
      mode === "manual"
        ? manualIds
            .map((pid) => products.find((p) => p.id === pid))
            .filter((p): p is Product => p != null)
        : autoMatched,
    [mode, manualIds, products, autoMatched],
  );

  const positionIndexOf = useMemo(
    () => new Map(displayedProducts.map((p, i) => [p.id, i])),
    [displayedProducts],
  );

  const sortedProducts = useMemo(
    () => sortCollectionProducts(displayedProducts, sortKey),
    [displayedProducts, sortKey],
  );

  const setCondition = (i: number, patch: Partial<CollectionCondition>) =>
    setConditions((cs) =>
      cs.map((c, idx) => {
        if (idx !== i) return c;
        const next = { ...c, ...patch };
        if (patch.kind && patch.kind !== c.kind) next.value = "";
        return next;
      }),
    );

  const wrapSelection = (before: string, after: string) => {
    const ta = descRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? description.length;
    const end = ta.selectionEnd ?? description.length;
    const sel = description.slice(start, end) || "văn bản";
    setDescription(
      description.slice(0, start) + before + sel + after + description.slice(end),
    );
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  const onImageFile = async (f: File | undefined) => {
    if (!f) return;
    const res = await processImageFile(f);
    if ("error" in res) {
      setImageError(res.error);
      return;
    }
    setImageError(null);
    setImageKey(res.dataUrl);
    setImageName(f.name);
  };

  const toggleStatusMut = useMutation({
    mutationFn: (next: CollectionStatus) =>
      api.adminUpdateCollection({ id: collection.id, title: collection.title, status: next }),
    onSuccess: (res, next) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không đổi được trạng thái bộ sưu tập.");
        return;
      }
      setStatus(next);
      setSavedSnapshot((prev) => {
        try {
          const parsed = JSON.parse(prev) as CollectionFormShape;
          return shapeOfCollectionForm({ ...parsed, status: next });
        } catch {
          return prev;
        }
      });
      setFormError(null);
      setNotice(
        next === "published"
          ? `Đã bật bộ sưu tập “${collection.title}” — trạng thái Đang hoạt động.`
          : `Đã tắt bộ sưu tập “${collection.title}”.`,
      );
      queryClient.invalidateQueries();
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const saveMut = useMutation({
    mutationFn: async (
      _snapshot: string,
    ): Promise<{ ok: boolean; error: string | null }> => {
      const res = await api.adminUpdateCollection({
        id: collection.id,
        title: title.trim(),
        status,
        kind: mode,
        conditions: validConditions,
        description,
        matchMode,
        visible: visibleOnList,
        imageKey,
        seoTitle,
        seoDescription,
      });
      if (!res.ok) return res;
      if (mode === "manual") {
        const res2 = await api.adminSetCollectionProducts({
          collectionId: collection.id,
          productIds: manualIds,
        });
        if (!res2.ok) return res2;
      }
      return res;
    },
    onSuccess: (res, snapshot) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không lưu được bộ sưu tập.");
        return;
      }
      setSavedSnapshot(snapshot);
      setFormError(null);
      setNotice(
        `Đã lưu bộ sưu tập “${title.trim()}” vào database chung — thẻ tag và danh sách sản phẩm đã khớp theo.`,
      );
      queryClient.invalidateQueries();
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const submit = () => {
    setFormError(null);
    setNotice(null);
    if (title.trim().length < 2)
      return setFormError("Tiêu đề bộ sưu tập cần ít nhất 2 ký tự.");
    if (mode === "auto" && validConditions.length === 0)
      return setFormError(
        "Chế độ Tự động cần ít nhất một điều kiện có giá trị — thêm điều kiện ở khối Điều kiện.",
      );
    if (imageError) return setFormError(`Ảnh bộ sưu tập: ${imageError}`);
    saveMut.mutate(shapeOfCollectionForm(currentCollectionShape()));
  };

  const deleteMut = useMutation({
    mutationFn: () => api.adminDeleteCollection({ collectionId: collection.id }),
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không xóa được bộ sưu tập.");
        return;
      }
      queryClient.invalidateQueries();
      onDeleted(
        `Đã xóa bộ sưu tập “${collection.title}” khỏi database chung — sản phẩm trong bộ vẫn giữ nguyên, chỉ mất thẻ tag của bộ này.`,
      );
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const moveManual = (i: number, dir: -1 | 1) =>
    setManualIds((ids) => {
      const j = i + dir;
      if (j < 0 || j >= ids.length) return ids;
      const next = [...ids];
      const tmp = next[i];
      const other = next[j];
      if (tmp == null || other == null) return ids;
      next[i] = other;
      next[j] = tmp;
      return next;
    });

  return {
    title,
    setTitle,
    description,
    setDescription,
    descPreview,
    setDescPreview,
    descRef,
    conditions,
    setConditions,
    matchMode,
    setMatchMode,
    mode,
    setMode,
    manualIds,
    setManualIds,
    visibleOnList,
    setVisibleOnList,
    imageKey,
    setImageKey,
    imageName,
    setImageName,
    imageError,
    setImageError,
    seoOpen,
    setSeoOpen,
    seoTitle,
    setSeoTitle,
    seoDescription,
    setSeoDescription,
    status,
    setStatus,
    sortKey,
    setSortKey,
    previewOpen,
    setPreviewOpen,
    confirmDelete,
    setConfirmDelete,
    notice,
    setNotice,
    formError,
    setFormError,
    isDirty,
    discardChanges,
    allTags,
    displayedProducts,
    sortedProducts,
    positionIndexOf,
    autoMatched,
    setCondition,
    wrapSelection,
    onImageFile,
    toggleStatusMut,
    saveMut,
    submit,
    deleteMut,
    moveManual,
  };
}
