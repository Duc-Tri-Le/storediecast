import type { CatalogData, Product, ShopCollection } from "../types";
import { emptyDraftVariant } from "../utils/productFormTypes";
import { BackButton, UnsavedChangesBar } from "../components/shared";
import {
  ProductDetailMainInfoSection,
  ProductDetailSeoSection,
  ProductDetailSidebarSection,
} from "../components/ProductDetailSections";
import { ProductDetailVariantsSection } from "../components/ProductDetailVariants";
import {
  ProductDetailPreviewSection,
  ProductDetailBottomBar,
} from "../components/ProductDetailExtraSections";
import { useProductDetailForm } from "../hooks/useProductDetailForm";

export function ProductDetailPage({
  product,
  allProducts,
  collections,
  catalog,
  backLabel = "Tất cả sản phẩm",
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
    catalog,
    onSaved,
    onDeleted,
    onDuplicated,
  });

  return (
    <div className="space-y-4">
      {/* Thanh lưu nổi khi có thay đổi */}
      <UnsavedChangesBar
        visible={form.isDirty}
        saving={form.saveMut.isPending}
        onSave={form.submit}
        onDiscard={form.discardChanges}
      />

      {/* Nút quay lại breadcrumb chuẩn tất cả sản phẩm */}
      <div>
        <BackButton label={backLabel} onClick={onBack} />
      </div>

      {/* Header thanh điều hướng & Thao tác nhanh tinh gọn */}
      <div className="flex flex-col gap-3 pb-3 border-b border-[var(--border)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">
            {product ? product.name : "Thêm sản phẩm mới"}
          </h1>
          {product && (
            <span className="rounded bg-[var(--sidebar)] px-2 py-0.5 text-xs font-mono font-semibold text-[var(--dim)]">
              #{product.id}
            </span>
          )}
        </div>

        {/* Cụm nút hành động góc phải */}
        <div className="flex items-center gap-2">
          {product && (
            <>
              <button
                type="button"
                aria-expanded={form.showPreview}
                onClick={() => form.setShowPreview((s) => !s)}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--dim)] transition hover:bg-[var(--sidebar)] hover:text-[var(--text)]"
              >
                {form.showPreview ? "✕ Đóng xem trước" : "👁 Xem trước"}
              </button>
              <button
                type="button"
                disabled={form.duplicateMut.isPending}
                onClick={() => form.duplicateMut.mutate()}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--dim)] transition hover:bg-[var(--sidebar)] hover:text-[var(--text)] disabled:opacity-50"
              >
                Nhân bản
              </button>
            </>
          )}
          <button
            type="button"
            disabled={form.saveMut.isPending}
            onClick={form.submit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--accent-dark)] disabled:opacity-50"
          >
            {form.saveMut.isPending ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Đang lưu…</span>
              </>
            ) : (
              <span>{product ? "Lưu thay đổi" : "Tạo sản phẩm"}</span>
            )}
          </button>
        </div>
      </div>

      {/* Thông báo thông tin & lỗi */}
      {form.notice && (
        <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-2.5 text-xs font-medium text-[var(--accent-dark)] flex items-center justify-between">
          <span>{form.notice}</span>
          <button
            type="button"
            onClick={() => form.setNotice(null)}
            className="text-[var(--dim)] hover:text-[var(--text)] font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}
      {form.formError && (
        <div className="rounded-xl border border-[#e3b3b3] bg-[#fbe3e3] px-4 py-2.5 text-xs font-medium text-[#9c2b2b] flex items-center justify-between">
          <span>{form.formError}</span>
          <button
            type="button"
            onClick={() => form.setFormError(null)}
            className="text-[#9c2b2b] hover:text-black font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Xem trước như khách thấy (khi bật) */}
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

      {/* Bố cục 2 cột: Cột chính 68% - Cột phụ 32% (Responsive) */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Cột trái: Thông tin sản phẩm & Biến thể */}
        <div className="min-w-0 space-y-4">
          <ProductDetailMainInfoSection
            name={form.name}
            setName={form.setName}
            brand={form.brand}
            setBrand={form.setBrand}
            scale={form.scale}
            setScale={form.setScale}
            vehicleType={form.vehicleType}
            setVehicleType={form.setVehicleType}
            modelMaker={form.modelMaker}
            setModelMaker={form.setModelMaker}
            catalog={catalog}
            description={form.description}
            setDescription={form.setDescription}
            descRef={form.descRef}
          />

          <ProductDetailVariantsSection
            variants={form.variants}
            imageKeys={form.imageKeys}
            setVariant={form.setVariant}
            onAddVariant={() => {
              form.setVariants((vs) => [...vs, emptyDraftVariant()]);
            }}
            onRemoveVariant={(i) => {
              form.setVariants((vs) => vs.filter((_, idx) => idx !== i));
            }}
          />

          {/* Phần SEO & Tìm kiếm đặt ở cột bên trái */}
          <ProductDetailSeoSection
            productId={product?.id}
            name={form.name}
            description={form.description}
            seoTitle={form.seoTitle}
            setSeoTitle={form.setSeoTitle}
            seoDescription={form.seoDescription}
            setSeoDescription={form.setSeoDescription}
            slug={form.slug}
            setSlug={form.setSlug}
            seoOpen={form.seoOpen}
            setSeoOpen={form.setSeoOpen}
          />
        </div>

        {/* Cột phải: Trạng thái, Phân loại, Chiết khấu */}
        <div className="space-y-4">
          <ProductDetailSidebarSection
            product={product}
            isFeatured={form.isFeatured}
            setIsFeatured={form.setIsFeatured}
            productCollections={form.productCollections}
            tags={form.tags}
            setTags={form.setTags}
            tagDraft={form.tagDraft}
            setTagDraft={form.setTagDraft}
            addTag={form.addTag}
          />
        </div>
      </div>

      {/* Chân trang: Thao tác tiện lợi */}
      <ProductDetailBottomBar
        product={product}
        confirmDelete={form.confirmDelete}
        setConfirmDelete={form.setConfirmDelete}
        isPendingDelete={form.deleteMut.isPending}
        onDelete={() => product && form.deleteMut.mutate(product.id)}
        onBack={onBack}
        isPendingSave={form.saveMut.isPending}
        onSubmit={form.submit}
        isDirty={form.isDirty}
      />
    </div>
  );
}
