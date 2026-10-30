import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { CatalogData, Product, ProductInput } from "../types";
import type { AddVariant } from "../utils/productFormTypes";
import {
  effectiveImageKey,
  emptyAddVariant,
  processImageFile,
} from "../utils/productFormTypes";
import { directImageSrc } from "../utils/format";
import { smallBtn } from "../components/shared";
import {
  AddProductMediaSection,
  AddProductTitleDescSection,
  AddProductVariantsSection,
} from "../components/AddProductSections";
import {
  AddProductPricingInventorySection,
  AddProductSidebarSection,
  AddProductSeoSection,
} from "../components/AddProductExtraSections";

export function AddProductPage({
  allProducts,
  catalog,
  onBack,
  onSaved,
}: {
  allProducts: Product[];
  catalog: CatalogData | null;
  onBack: () => void;
  onSaved: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [scale, setScale] = useState<string>("");
  const [modelMaker, setModelMaker] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [description, setDescription] = useState("");
  const [descPreview, setDescPreview] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [variants, setVariants] = useState<AddVariant[]>([emptyAddVariant()]);
  const [inventoryPolicy, setInventoryPolicy] = useState<"track_stop" | "no_track">("track_stop");
  const [weightKg, setWeightKg] = useState("");
  const [openPicker, setOpenPicker] = useState<number | null>(null);
  const [mediaTarget, setMediaTarget] = useState(0);
  const [seoOpen, setSeoOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const mediaFileRef = useRef<HTMLInputElement>(null);

  const imageKeys = useMemo(() => {
    const s = new Set<string>(["scale164", "scale132", "scale116"]);
    for (const p of allProducts) {
      for (const im of p.images) {
        if (!directImageSrc(im.imageKey)) s.add(im.imageKey);
      }
      for (const v of p.variants) {
        if (!directImageSrc(v.imageKey)) s.add(v.imageKey);
      }
    }
    return [...s].sort();
  }, [allProducts]);

  useEffect(() => {
    if (!catalog) return;
    if (!scale) {
      const scales = catalog.scales.map((s) => s.name);
      setScale(scales.includes("1:32") ? "1:32" : (scales[0] ?? ""));
    }
    if (!vehicleType && catalog.vehicleTypes.length > 0) {
      setVehicleType(catalog.vehicleTypes[0]?.name ?? "");
    }
  }, [catalog, scale, vehicleType]);

  const first: AddVariant = variants[0] ?? emptyAddVariant();
  const setVariant = (i: number, patch: Partial<AddVariant>) =>
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const setFirst = (patch: Partial<AddVariant>) => setVariant(0, patch);

  const saveMut = useMutation({
    mutationFn: (input: ProductInput) => api.adminUpsertProduct(input),
    onSuccess: (res) => {
      if (!res.ok) {
        setFormError(res.error ?? "Không lưu được sản phẩm.");
        return;
      }
      queryClient.invalidateQueries();
      onSaved(`Đã thêm “${name.trim()}” vào database chung — sản phẩm đã lên web khách.`);
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : String(e)),
  });

  const submit = () => {
    setFormError(null);
    if (name.trim().length < 2) return setFormError("Tên sản phẩm cần ít nhất 2 ký tự.");
    if (!brand) return setFormError("Chưa chọn hãng xe — chọn từ Quản lý danh mục → Hãng xe.");
    if (!scale) return setFormError("Chưa chọn tỉ lệ — chọn từ Quản lý danh mục → Tỉ lệ.");
    if (variants.length === 0) return setFormError("Cần ít nhất một màu (biến thể).");

    const parsedVariants = variants.map((v, idx) => {
      const num = (s: string) => Number(s.replace(/[^\d]/g, "") || "0");
      const sell = num(v.sellPrice);
      const comp = num(v.compareAt);
      const cost = num(v.costPrice);
      const stk = Math.max(0, parseInt(v.stock.replace(/[^\d]/g, "") || "0", 10));
      return {
        id: null as number | null,
        colorName: v.colorName.trim() || `Màu ${idx + 1}`,
        price: comp > 0 ? comp : sell,
        promoPrice: comp > 0 ? sell : null,
        costPrice: cost > 0 ? cost : null,
        stock: stk,
        imageKey: effectiveImageKey(v),
        barcode: v.barcode.trim() || undefined,
        variantTag: v.variantTag.trim() || undefined,
      };
    });

    for (let i = 0; i < parsedVariants.length; i++) {
      const pv = parsedVariants[i];
      if (!pv || pv.price <= 0) {
        return setFormError(
          `Màu ${i + 1} (${pv?.colorName || "chưa đặt tên"}): giá bán phải lớn hơn 0.`,
        );
      }
      if (pv.promoPrice != null && pv.promoPrice >= pv.price) {
        return setFormError(
          `Màu ${i + 1}: giá so sánh phải lớn hơn giá bán thì mới tính là khuyến mãi.`,
        );
      }
    }

    const payload: ProductInput = {
      id: null,
      name: name.trim(),
      brand: brand.trim(),
      scale: scale.trim(),
      modelMaker: modelMaker.trim(),
      vehicleType: vehicleType.trim() || "Khác",
      description: description.trim(),
      features: tags.join(" · "),
      isFeatured,
      inventoryPolicy,
      variants: parsedVariants,
    };
    saveMut.mutate(payload);
  };

  const addTag = () => {
    const t = tagDraft.trim().replace(/[,·]$/, "");
    if (!t) return;
    if (!tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags([...tags, t]);
    setTagDraft("");
  };

  const onMediaFile = async (f: File | undefined) => {
    if (!f) return;
    const target = Math.min(mediaTarget, Math.max(0, variants.length - 1));
    const res = await processImageFile(f);
    if ("error" in res) {
      setFormError(`Ảnh cho màu ${target + 1}: ${res.error}`);
      return;
    }
    setVariant(target, {
      imageMode: "upload",
      uploadDataUrl: res.dataUrl,
      uploadName: f.name,
      uploadError: null,
    });
    setNotice(
      `Đã nhận ảnh tải lên cho Màu ${target + 1} — ảnh được lưu vào database chung khi bấm Lưu sản phẩm.`,
    );
  };

  const targetIdx = Math.min(mediaTarget, Math.max(0, variants.length - 1));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại Sản phẩm"
          className="inline-flex items-center gap-1 rounded-md bg-[var(--sidebar)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--dim)] uppercase hover:text-[var(--text)]"
        >
          ‹ Sản phẩm
        </button>
        <h1 className="w-full text-2xl font-bold tracking-tight sm:w-auto">Thêm sản phẩm</h1>
        <span className="flex-1" />
        <button type="button" onClick={onBack} className={smallBtn}>
          Hủy
        </button>
        <button
          type="button"
          disabled={saveMut.isPending}
          onClick={submit}
          className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saveMut.isPending ? "Đang lưu…" : "Lưu"}
        </button>
      </div>

      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">{notice}</p>
      )}
      {formError && (
        <p className="mt-4 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">{formError}</p>
      )}

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <AddProductTitleDescSection
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            descPreview={descPreview}
            setDescPreview={setDescPreview}
            descRef={descRef}
          />

          <AddProductMediaSection
            variants={variants}
            targetIdx={targetIdx}
            setMediaTarget={setMediaTarget}
            onPickMediaUrl={() => {
              setVariant(targetIdx, { imageMode: "link" });
              setOpenPicker(targetIdx);
            }}
            onPickMediaFile={() => mediaFileRef.current?.click()}
            onSelectVariantMedia={(i) => {
              setMediaTarget(i);
              setOpenPicker(i);
            }}
            mediaFileRef={mediaFileRef}
            onMediaFile={onMediaFile}
          />

          <AddProductPricingInventorySection
            first={first}
            setFirst={setFirst}
            variants={variants}
            setVariant={setVariant}
            inventoryPolicy={inventoryPolicy}
            setInventoryPolicy={setInventoryPolicy}
            weightKg={weightKg}
            setWeightKg={setWeightKg}
          />

          <AddProductVariantsSection
            variants={variants}
            setVariants={setVariants}
            openPicker={openPicker}
            setOpenPicker={setOpenPicker}
            imageKeys={imageKeys}
          />
        </div>

        <AddProductSidebarSection
          isFeatured={isFeatured}
          setIsFeatured={setIsFeatured}
          vehicleType={vehicleType}
          setVehicleType={setVehicleType}
          brand={brand}
          setBrand={setBrand}
          modelMaker={modelMaker}
          setModelMaker={setModelMaker}
          scale={scale}
          setScale={setScale}
          tags={tags}
          setTags={setTags}
          tagDraft={tagDraft}
          setTagDraft={setTagDraft}
          addTag={addTag}
          catalog={catalog}
        />
      </div>

      <AddProductSeoSection
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        seoOpen={seoOpen}
        setSeoOpen={setSeoOpen}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex-1" />
        <button type="button" onClick={onBack} className={smallBtn}>
          Hủy
        </button>
        <button
          type="button"
          disabled={saveMut.isPending}
          onClick={submit}
          className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saveMut.isPending ? "Đang lưu…" : "Lưu sản phẩm"}
        </button>
      </div>
    </div>
  );
}
