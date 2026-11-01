import { useState, useMemo, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Product } from "../types";
import type {
  CollectionKind,
  CollectionStatus,
  CollectionCondition,
  MatchMode,
} from "../utils/collectionRules";
import {
  productMatchesConditions,
  productTags,
} from "../utils/collectionRules";
import { processImageFile } from "../utils/productFormTypes";
import { slugify } from "../utils/slug";

export function useCollectionCreatorForm({
  products,
  onCreated,
}: {
  products: Product[];
  onCreated: (c: { id: number; title: string; status: CollectionStatus }) => void;
}) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CollectionStatus>("published");
  const [visibleOnList, setVisibleOnList] = useState(true);
  const [mode, setMode] = useState<CollectionKind>("manual");
  const [pickedIds, setPickedIds] = useState<number[]>([]);
  const [pickSearch, setPickSearch] = useState("");
  const [conditions, setConditions] = useState<CollectionCondition[]>([
    { kind: "scale", operator: "eq", value: "" },
  ]);
  const [matchMode, setMatchMode] = useState<MatchMode>("all");

  const [imageKey, setImageKey] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);

  const [seoOpen, setSeoOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [customSlug, setCustomSlug] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [duplicatePrompt, setDuplicatePrompt] = useState<{
    open: boolean;
    message: string;
  } | null>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const allTags = useMemo(
    () =>
      [...new Set(products.flatMap((p) => productTags(p)))].sort((a, b) =>
        a.localeCompare(b, "vi"),
      ),
    [products],
  );

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

  const validConditions = useMemo(
    () => conditions.filter((c) => c.value.trim()),
    [conditions],
  );

  const autoMatchedProducts = useMemo(
    () =>
      mode === "auto" && validConditions.length > 0
        ? products.filter((p) => productMatchesConditions(p, validConditions, matchMode))
        : [],
    [mode, validConditions, matchMode, products],
  );

  const previewProducts = useMemo(() => {
    if (mode === "auto") return autoMatchedProducts;
    return products.filter((p) => pickedIds.includes(p.id));
  }, [mode, autoMatchedProducts, products, pickedIds]);

  const slug = customSlug.trim() || slugify(title);

  const handleImageFile = async (f?: File) => {
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

  const createMut = useMutation({
    mutationFn: (payload: any) => api.adminCreateCollection(payload),
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không tạo được bộ sưu tập.");
        return;
      }
      queryClient.invalidateQueries();
      onCreated({ id: res.collectionId ?? 0, title: title.trim(), status });
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const performSave = () => {
    setFormError(null);
    createMut.mutate({
      title: title.trim(),
      description: description.trim(),
      status,
      visibleOnList,
      mode,
      productIds: mode === "manual" ? pickedIds : [],
      conditions: mode === "auto" ? validConditions : [],
      matchMode: mode === "auto" ? matchMode : "all",
      imageKey: imageKey.trim(),
      slug: slug || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    });
  };

  const submit = () => {
    setFormError(null);
    if (!title.trim()) {
      setFormError("Vui lòng nhập tên bộ sưu tập.");
      return;
    }

    if (mode === "auto") {
      const scaleCond = validConditions.find((c) => c.kind === "scale" && c.operator === "eq");
      if (scaleCond && scaleCond.value.trim()) {
        const targetScale = scaleCond.value.trim();
        const dup = products.some((p) => p.scale === targetScale);
        if (dup && validConditions.length === 1) {
          setDuplicatePrompt({
            open: true,
            message: `Hệ thống đã có Bộ sưu tập cơ sở riêng cho Tỉ lệ “${targetScale}”. Tạo thêm bộ sưu tập với điều kiện trùng có thể gây nhầm lẫn trên thanh menu.`,
          });
          return;
        }
      }
    }

    performSave();
  };

  const setCondition = (idx: number, patch: Partial<CollectionCondition>) => {
    setConditions((cs) => cs.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const isDirty = Boolean(
    title ||
      description ||
      imageKey ||
      pickedIds.length > 0 ||
      validConditions.length > 0 ||
      customSlug,
  );

  return {
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    visibleOnList,
    setVisibleOnList,
    mode,
    setMode,
    pickedIds,
    setPickedIds,
    pickSearch,
    setPickSearch,
    conditions,
    setConditions,
    setCondition,
    matchMode,
    setMatchMode,
    imageKey,
    setImageKey,
    imageName,
    setImageName,
    imageError,
    setImageError,
    handleImageFile,
    seoOpen,
    setSeoOpen,
    seoTitle,
    setSeoTitle,
    seoDescription,
    setSeoDescription,
    customSlug,
    setCustomSlug,
    slug,
    formError,
    duplicatePrompt,
    setDuplicatePrompt,
    descRef,
    allTags,
    pickable,
    validConditions,
    autoMatchedProducts,
    previewProducts,
    isDirty,
    createMut,
    performSave,
    submit,
  };
}

