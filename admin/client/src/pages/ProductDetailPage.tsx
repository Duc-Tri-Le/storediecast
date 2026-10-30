import type { CatalogData, Product, ShopCollection } from "../types";
import { emptyDraftVariant } from "../utils/productFormTypes";
import { cardCls, smallBtn, UnsavedChangesBar } from "../components/shared";
import {
  ProductDetailMediaSection,
  ProductDetailOrganizationSection,
} from "../components/ProductDetailSections";
import { ProductDetailVariantsSection } from "../components/ProductDetailVariants";
import {
  ProductDetailPreviewSection,
  ProductDetailTitleDescSection,
  ProductDetailSeoSection,
  ProductDetailBottomBar,
} from "../components/ProductDetailExtraSections";
import { useProductDetailForm } from "../hooks/useProductDetailForm";

export function ProductDetailPage({
  product,
  allProducts,
  collections,
  catalog,
  backLabel = "Sản phẩm",
  onBack,
  onSaved,
  onDeleted,
  onDuplicated,
}: {
  product: Product | null;
  allProducts: Product[];
  collections: ShopCollection[];
  catalog: CatalogData | null;
  backLabel?: string;
  onBack: () => void;
  onSaved: (msg: string) => void;
  onDeleted: (msg: string) => void;
  onDuplicated: (msg: string) => void;
}) {
  const form = useProductDetailForm({
    product,
    allProducts,
    collections,
    onSaved,
    onDeleted,
    onDuplicated,
  });

  return (
    <div>
      <UnsavedChangesBar
        visible={form.isDirty}
        saving={form.saveMut.isPending}
        onSave={form.submit}
        onDiscard={form.discardChanges}
      />
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 rounded-md bg-[var(--sidebar)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--dim)] uppercase hover:text-[var(--text)]"
      >
        ‹ {backLabel}
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold tracking-tight">
          {product ? product.name : "Thêm sản phẩm"}
        </h1>
        {product && (
          <>
            <button
              type="button"
              disabled={form.duplicateMut.isPending}
              onClick={() => form.duplicateMut.mutate()}
              className={smallBtn}
            >
              Nhân bản
            </button>
            <button
              type="button"
              aria-expanded={form.showPreview}
              onClick={() => form.setShowPreview((s) => !s)}
              className={smallBtn}
            >
              Xem
            </button>
          </>
        )}
      </div>

      {form.notice && (
        <p className="mt-4 rounded-lg bg-[var(--accent-soft)] px-4 py-3 text-sm">
          {form.notice}
        </p>
      )}
      {form.formError && (
        <p className="mt-4 rounded-lg bg-[#fbe3e3] px-4 py-3 text-sm text-[#9c2b2b]">
          {form.formError}
        </p>
      )}

      {form.showPreview && product && (
        <ProductDetailPreviewSection
          product={product}
          name={form.name}
          brand={form.brand}
          scale={form.scale}
          variants={form.variants}
          description={form.description}
          targetVariant={form.targetVariant}
        />
      )}

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <ProductDetailTitleDescSection
            name={form.name}
            setName={form.setName}
            description={form.description}
            setDescription={form.setDescription}
            descPreview={form.descPreview}
            descRef={form.descRef}
          />

          <ProductDetailMediaSection
            variants={form.variants}
            mediaTarget={form.mediaTarget}
            setMediaTarget={form.setMediaTarget}
            mediaUrlOpen={form.mediaUrlOpen}
            setMediaUrlOpen={form.setMediaUrlOpen}
            mediaUrl={form.mediaUrl}
            onMediaUrlChange={form.onMediaUrlChange}
            mediaUrlState={form.mediaUrlState}
            applyMediaUrl={form.applyMediaUrl}
            mediaFileRef={form.mediaFileRef}
            setOpenPicker={form.setOpenPicker}
          />

          <ProductDetailVariantsSection
            variants={form.variants}
            setVariant={form.setVariant}
            onAddVariant={() => {
              form.setVariants((vs) => [...vs, emptyDraftVariant()]);
              form.setOpenPicker(form.variants.length);
            }}
            onRemoveVariant={(i) => {
              form.setVariants((vs) => vs.filter((_, idx) => idx !== i));
              form.setOpenPicker(null);
            }}
            dragVariantFrom={form.dragVariantFrom}
            dragVariantTarget={form.dragVariantTarget}
            variantCardsRef={form.variantCardsRef}
            onVariantHandleDown={form.onVariantHandleDown}
            onVariantHandleMove={form.onVariantHandleMove}
            endVariantDrag={form.endVariantDrag}
            reorderVariant={form.reorderVariant}
            openPicker={form.openPicker}
            imageKeys={form.imageKeys}
            setNotice={form.setNotice}
          />
        </div>

        <div className="space-y-4">
          <section className={cardCls} aria-label="Tình trạng hiển thị">
            <h2 className="text-sm font-bold">Tình trạng hiển thị</h2>
            <p className="mt-2 flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className={`h-2.5 w-2.5 rounded-full ${
                  product ? "bg-[#22a06b]" : "bg-[#d9a514]"
                }`}
              />
              {product
                ? "Hiện trên web bán hàng"
                : "Chưa lưu — sẽ hiện trên web bán hàng ngay sau khi lưu"}
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => form.setIsFeatured(e.target.checked)}
                className="h-4 w-4"
              />
              Sản phẩm nổi bật trên web khách
            </label>
          </section>

          <ProductDetailOrganizationSection
            vehicleType={form.vehicleType}
            setVehicleType={form.setVehicleType}
            brand={form.brand}
            setBrand={form.setBrand}
            modelMaker={form.modelMaker}
            setModelMaker={form.setModelMaker}
            scale={form.scale}
            setScale={form.setScale}
            catalog={catalog}
            product={product}
            productCollections={form.productCollections}
            tags={form.tags}
            setTags={form.setTags}
            tagDraft={form.tagDraft}
            setTagDraft={form.setTagDraft}
            addTag={form.addTag}
          />
        </div>
      </div>

      <ProductDetailSeoSection
        name={form.name}
        setName={form.setName}
        description={form.description}
        setDescription={form.setDescription}
        seoOpen={form.seoOpen}
        setSeoOpen={form.setSeoOpen}
      />

      <ProductDetailBottomBar
        product={product}
        confirmDelete={form.confirmDelete}
        setConfirmDelete={form.setConfirmDelete}
        isPendingDelete={form.deleteMut.isPending}
        onDelete={() => product && form.deleteMut.mutate(product.id)}
        onBack={onBack}
        isPendingSave={form.saveMut.isPending}
        onSubmit={form.submit}
      />
    </div>
  );
}
