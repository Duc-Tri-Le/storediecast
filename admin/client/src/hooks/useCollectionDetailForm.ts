import { useState, useRef, useMemo } from "react";
import type { Product, ShopCollection } from "../types";
import type {
  CollectionCondition,
  CollectionKind,
  CollectionStatus,
  MatchMode,
} from "../utils/collectionRules";
import {
  productMatchesConditions,
  productTags,
} from "../utils/collectionRules";
import { processImageFile } from "../utils/productFormTypes";
import type { CollectionSortKey } from "../components/CollectionProductList";
import {
  type CollectionFormShape,
  shapeOfCollectionForm,
  sortCollectionProducts,
} from "../utils/collectionFormHelpers";
import { useCollectionDetailMutations } from "./useCollectionDetailMutations";

export function useCollectionDetailForm({
  collection,
  products,
  onDeleted,
}: {
  collection: ShopCollection;
  products: Product[];
  onDeleted: (msg: string) => void;
}) {
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
  const [slug, setSlug] = useState(collection.slug || "");
  const [status, setStatus] = useState<CollectionStatus>(
    collection.status === "draft" ? "draft" : "published",
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
      status: collection.status === "draft" ? "draft" : "published",
      mode: collection.kind === "auto" ? "auto" : "manual",
      conditions:
        (collection.conditions as CollectionCondition[]).length > 0
          ? (collection.conditions as CollectionCondition[])
          : [{ kind: "scale", operator: "eq", value: "" }],
      matchMode: collection.matchMode === "all" ? "all" : "any",
      visibleOnList: collection.visible,
      imageKey: collection.imageKey,
      seoTitle: collection.seoTitle,
      seoDescription: collection.seoDescription,
      slug: collection.slug || "",
      manualIds: collection.productIds,
      sortKey: "manual",
    }),
  );

  const currentCollectionShape = (): CollectionFormShape => ({
    title,
    description,
    status,
    mode,
    conditions,
    matchMode,
    visibleOnList,
    imageKey,
    seoTitle,
    seoDescription,
    slug,
    manualIds,
    sortKey,
  });

  const isDirty = shapeOfCollectionForm(currentCollectionShape()) !== savedSnapshot;

  const discardChanges = () => {
    try {
      const snap = JSON.parse(savedSnapshot) as CollectionFormShape;
      setTitle(snap.title);
      setDescription(snap.description);
      setStatus(snap.status);
      setMode(snap.mode);
      setConditions(snap.conditions);
      setMatchMode(snap.matchMode);
      setVisibleOnList(snap.visibleOnList);
      setImageKey(snap.imageKey);
      setSeoTitle(snap.seoTitle);
      setSeoDescription(snap.seoDescription);
      setSlug(snap.slug);
      setManualIds(snap.manualIds);
      setSortKey(snap.sortKey || "manual");
      setImageName("");
      setImageError(null);
      setFormError(null);
    } catch {
      // ignore
    }
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
      mode === "auto" && validConditions.length > 0
        ? products.filter((p) => productMatchesConditions(p, validConditions, matchMode))
        : [],
    [mode, validConditions, matchMode, products],
  );

  const displayedProducts = useMemo(() => {
    if (mode === "auto") return autoMatched;
    const manualMap = new Map(products.map((p) => [p.id, p]));
    return manualIds
      .map((id) => manualMap.get(id))
      .filter((p): p is Product => p != null);
  }, [mode, autoMatched, manualIds, products]);

  const positionIndexOf = useMemo(
    () => new Map(displayedProducts.map((p, idx) => [p.id, idx])),
    [displayedProducts],
  );

  const sortedProducts = useMemo(
    () => sortCollectionProducts(displayedProducts, sortKey),
    [displayedProducts, sortKey],
  );

  const setCondition = (i: number, patch: Partial<CollectionCondition>) =>
    setConditions((cs) =>
      cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    );

  const wrapSelection = (before: string, after: string) => {
    const el = descRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const old = description;
    const selectedText = old.substring(start, end);
    const rep = `${before}${selectedText}${after}`;
    const next = old.substring(0, start) + rep + old.substring(end);
    setDescription(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    });
  };

  const onImageFile = async (f: File | undefined) => {
    if (!f) return;
    setImageError(null);
    setImageName(f.name);
    try {
      const res = await processImageFile(f);
      if ("error" in res) {
        setImageError(res.error);
      } else {
        setImageKey(res.dataUrl);
      }
    } catch (err: any) {
      setImageError(err?.message || "Không thể nén ảnh.");
    }
  };

  const {
    duplicatePrompt,
    toggleStatusMut,
    saveMut,
    submit,
    confirmDuplicateSave,
    cancelDuplicateSave,
    deleteMut,
  } = useCollectionDetailMutations({
    collection,
    title,
    description,
    status,
    setStatus,
    mode,
    validConditions,
    matchMode,
    visibleOnList,
    imageKey,
    seoTitle,
    seoDescription,
    slug,
    manualIds,
    imageError,
    currentCollectionShape,
    setSavedSnapshot,
    setNotice,
    setFormError,
    onDeleted,
  });

  const moveManual = (i: number, dir: -1 | 1) =>
    setManualIds((ids) => {
      const j = i + dir;
      if (j < 0 || j >= ids.length) return ids;
      const next = [...ids];
      const a = next[i];
      const b = next[j];
      if (a === undefined || b === undefined) return ids;
      next[i] = b;
      next[j] = a;
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
    slug,
    setSlug,
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
    duplicatePrompt,
    confirmDuplicateSave,
    cancelDuplicateSave,
    deleteMut,
    moveManual,
  };
}
