import { useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Product, ProductInput, ShopCollection } from "../types";
import type { DraftVariant, ProductFormShape } from "../utils/productFormTypes";
import {
  draftFromVariant,
  emptyDraftVariant,
  persistedVariantFromDraft,
  productShapeFromProduct,
} from "../utils/productFormTypes";
import {
  buildDuplicateProductInput,
  validateProductDraft,
} from "../utils/productValidation";
import type { CollectionCondition } from "../utils/collectionRules";
import { productMatchesConditions } from "../utils/collectionRules";

export function useProductDetailForm({
  product,
  allProducts,
  collections,
  onSaved,
  onDeleted,
  onDuplicated,
}: {
  product: Product | null;
  allProducts: Product[];
  collections: ShopCollection[];
  onSaved: (msg: string) => void;
  onDeleted: (msg: string) => void;
  onDuplicated: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [scale, setScale] = useState<string>(product?.scale ?? "1:32");
  const [modelMaker, setModelMaker] = useState(product?.modelMaker ?? "");
  const [vehicleType, setVehicleType] = useState(product?.vehicleType ?? "");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [description, setDescription] = useState(product?.description ?? "");
  const [tags, setTags] = useState<string[]>(
    (product?.features ?? "")
      .split("·")
      .map((t) => t.trim())
      .filter(Boolean),
  );
  const [tagDraft, setTagDraft] = useState("");
  const [variants, setVariants] = useState<DraftVariant[]>(
    product
      ? [...product.variants]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(draftFromVariant)
      : [emptyDraftVariant()],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [descPreview] = useState(false);
  const [dragVariantFrom, setDragVariantFrom] = useState<number | null>(null);
  const [dragVariantTarget, setDragVariantTarget] = useState<number | null>(null);
  const variantCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const variantDragRef = useRef<{ from: number; target: number } | null>(null);
  const [openPicker, setOpenPicker] = useState<number | null>(null);
  const [mediaTarget, setMediaTarget] = useState(0);
  const [mediaUrlOpen, setMediaUrlOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaUrlState, setMediaUrlState] = useState<"idle" | "checking" | "ok" | "error">(
    "idle",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const mediaFileRef = useRef<HTMLInputElement>(null);

  const [savedSnapshot, setSavedSnapshot] = useState<string>(() =>
    product ? JSON.stringify(productShapeFromProduct(product)) : "",
  );

  const currentShape = (): ProductFormShape => ({
    name: name.trim(),
    brand,
    scale,
    modelMaker,
    vehicleType,
    isFeatured,
    description: description.trim(),
    tags: tags.map((t) => t.trim()).filter(Boolean),
    variants: variants.map(persistedVariantFromDraft),
  });

  const isDirty = product ? JSON.stringify(currentShape()) !== savedSnapshot : false;

  const discardChanges = () => {
    if (!product) return;
    let saved: ProductFormShape;
    try {
      saved = JSON.parse(savedSnapshot) as ProductFormShape;
    } catch {
      return;
    }
    setName(saved.name);
    setBrand(saved.brand);
    setScale(saved.scale);
    setModelMaker(saved.modelMaker);
    setVehicleType(saved.vehicleType);
    setIsFeatured(saved.isFeatured);
    setDescription(saved.description);
    setTags(saved.tags);
    setTagDraft("");
    setVariants(
      product.variants
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(draftFromVariant),
    );
    setFormError(null);
    setNotice(null);
    setShowPreview(false);
    setSeoOpen(false);
  };

  const imageKeys = useMemo(() => {
    const s = new Set<string>(["scale164", "scale132", "scale116"]);
    for (const p of allProducts) {
      for (const im of p.images) s.add(im.imageKey);
      for (const v of p.variants) s.add(v.imageKey);
    }
    return [...s].sort();
  }, [allProducts]);

  const productCollections = useMemo(() => {
    if (!product) return [];
    return collections.filter((c) => {
      if (c.kind === "manual") return c.productIds.includes(product.id);
      return productMatchesConditions(
        product,
        c.conditions as CollectionCondition[],
        c.matchMode,
      );
    });
  }, [collections, product]);

  const setVariant = (i: number, patch: Partial<DraftVariant>) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const reorderVariant = (from: number, to: number) => {
    if (from === to) return;
    setVariants((vs) => {
      const next = [...vs];
      const [item] = next.splice(from, 1);
      if (item) next.splice(to, 0, item);
      return next;
    });
  };

  const onVariantHandleDown = (e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    variantDragRef.current = { from: i, target: i };
    setDragVariantFrom(i);
    setDragVariantTarget(i);
  };

  const onVariantHandleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!variantDragRef.current) return;
    const y = e.clientY;
    for (let idx = 0; idx < variantCardsRef.current.length; idx++) {
      const el = variantCardsRef.current[idx];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        if (variantDragRef.current.target !== idx) {
          variantDragRef.current.target = idx;
          setDragVariantTarget(idx);
        }
        break;
      }
    }
  };

  const endVariantDrag = (apply = true) => {
    const cur = variantDragRef.current;
    if (apply && cur && cur.from !== cur.target) {
      reorderVariant(cur.from, cur.target);
      setNotice(
        `Đã đổi thứ tự màu — Màu ${cur.from + 1} chuyển sang vị trí ${cur.target + 1}. Bấm Lưu để cập nhật.`,
      );
    }
    variantDragRef.current = null;
    setDragVariantFrom(null);
    setDragVariantTarget(null);
  };

  const saveMut = useMutation({
    mutationFn: ({ input }: { input: ProductInput; _snapshot: string }) =>
      api.adminUpsertProduct(input),
    onSuccess: (res, vars) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không lưu được sản phẩm.");
        return;
      }
      setSavedSnapshot(vars._snapshot);
      setFormError(null);
      setNotice("Đã lưu sản phẩm vào database chung — web bán hàng cập nhật ngay.");
      queryClient.invalidateQueries();
      onSaved(
        product
          ? `Đã lưu sản phẩm “${name.trim()}”.`
          : `Đã thêm sản phẩm “${name.trim()}”.`,
      );
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.adminDeleteProduct({ productId: id }),
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không xóa được sản phẩm.");
        return;
      }
      queryClient.invalidateQueries();
      onDeleted(`Đã xóa “${product?.name}” khỏi database chung.`);
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const duplicateMut = useMutation({
    mutationFn: () => {
      if (!product) throw new Error("Chưa có sản phẩm để nhân bản.");
      return api.adminUpsertProduct(
        buildDuplicateProductInput({
          name,
          brand,
          scale,
          modelMaker,
          vehicleType,
          description,
          tags,
          variants,
        }),
      );
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không nhân bản được sản phẩm.");
        return;
      }
      queryClient.invalidateQueries();
      onDuplicated(`Đã tạo bản sao “Bản sao của ${name.trim()}” trong database chung.`);
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const submit = () => {
    setFormError(null);
    setNotice(null);
    const result = validateProductDraft({
      name,
      brand,
      scale,
      vehicleType,
      description,
      tags,
      isFeatured,
      modelMaker,
      variants,
      productId: product?.id ?? null,
    });
    if (!result.ok) {
      return setFormError(result.error);
    }

    saveMut.mutate({
      input: result.input,
      _snapshot: JSON.stringify(currentShape()),
    });
  };

  const addTag = () => {
    const t = tagDraft.trim().replace(/[,·]$/, "");
    if (!t) return;
    if (!tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags([...tags, t]);
    setTagDraft("");
  };

  const onMediaUrlChange = (value: string) => {
    setMediaUrl(value);
    const trimmed = value.trim();
    if (!trimmed) return setMediaUrlState("idle");
    try {
      const u = new URL(trimmed);
      setMediaUrlState(
        u.protocol === "http:" || u.protocol === "https:" ? "checking" : "error",
      );
    } catch {
      setMediaUrlState("error");
    }
  };

  const applyMediaUrl = () => {
    setVariant(mediaTarget, {
      imageMode: "link",
      linkUrl: mediaUrl.trim(),
      linkState: "ok",
    });
    setOpenPicker(mediaTarget);
    setMediaUrlOpen(false);
    setMediaUrl("");
    setMediaUrlState("idle");
    setNotice(
      `Đã gắn link ảnh cho màu ${mediaTarget + 1} — bấm Lưu để ghi vào database chung.`,
    );
  };

  const targetVariant = variants[Math.min(mediaTarget, Math.max(0, variants.length - 1))];

  return {
    name,
    setName,
    brand,
    setBrand,
    scale,
    setScale,
    modelMaker,
    setModelMaker,
    vehicleType,
    setVehicleType,
    isFeatured,
    setIsFeatured,
    description,
    setDescription,
    tags,
    setTags,
    tagDraft,
    setTagDraft,
    variants,
    setVariants,
    formError,
    notice,
    setNotice,
    showPreview,
    setShowPreview,
    seoOpen,
    setSeoOpen,
    descPreview,
    dragVariantFrom,
    dragVariantTarget,
    variantCardsRef,
    openPicker,
    setOpenPicker,
    mediaTarget,
    setMediaTarget,
    mediaUrlOpen,
    setMediaUrlOpen,
    mediaUrl,
    mediaUrlState,
    confirmDelete,
    setConfirmDelete,
    descRef,
    mediaFileRef,
    isDirty,
    discardChanges,
    imageKeys,
    productCollections,
    setVariant,
    reorderVariant,
    onVariantHandleDown,
    onVariantHandleMove,
    endVariantDrag,
    saveMut,
    deleteMut,
    duplicateMut,
    submit,
    addTag,
    onMediaUrlChange,
    applyMediaUrl,
    targetVariant,
  };
}
