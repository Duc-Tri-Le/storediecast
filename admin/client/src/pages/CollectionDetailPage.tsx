import { useMemo } from "react";
import type { Product, ShopCollection, CatalogData } from "../types";
import type {
  CollectionRow,
  CollectionNav,
} from "../utils/collectionRules";
import { UnsavedChangesBar } from "../components/shared";
import { CollectionProductList } from "../components/CollectionProductList";
import {
  CollectionSeoSection,
  CollectionImageSection,
  CollectionPreviewModal,
} from "../components/CollectionDetailSections";
import { CollectionDetailBasicInfo } from "../components/CollectionDetailBasicInfo";
import { CollectionDetailModeSection } from "../components/CollectionDetailModeSection";
import { useCollectionDetailForm } from "../hooks/useCollectionDetailForm";
import { slugify } from "../utils/slug";
import { totalStock } from "../utils/format";
import { CollectionDetailHeader } from "../components/CollectionDetailHeader";
import { CollectionDetailStatsCard } from "../components/CollectionDetailStatsCard";
import { CollectionDetailFooter } from "../components/CollectionDetailFooter";
import { CollectionDetailDuplicateModal } from "../components/CollectionDetailDuplicateModal";

export function CollectionDetailPage({
  row,
  collection,
  products,
  catalog,
  onBack,
  onDeleted,
  onViewNav,
  onOpenProduct,
}: {
  row: CollectionRow;
  collection: ShopCollection;
  products: Product[];
  catalog: CatalogData | null;
  onBack: () => void;
  onDeleted: (msg: string) => void;
  onViewNav: (nav: CollectionNav) => void;
  onOpenProduct: (p: Product) => void;
}) {
  const isBase = row.isBase;
  const form = useCollectionDetailForm({
    collection,
    products,
    onDeleted,
  });

  // Thống kê nhanh của bộ sưu tập
  const items = form.displayedProducts;
  const totalItemsCount = items.length;
  const totalStockCount = useMemo(
    () => items.reduce((sum, p) => sum + Math.max(0, totalStock(p)), 0),
    [items],
  );
  const priceRange = useMemo(() => {
    const prices = items
      .flatMap((p) => p.variants.map((v) => v.promoPrice || v.price))
      .filter((pr) => pr > 0);
    if (prices.length === 0) return null;
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [items]);

  const liveCollectionUrl = collection.id
    ? `http://localhost:3000/collections/${collection.id}`
    : `http://localhost:3000/collections/${form.slug || slugify(form.title) || "bo-suu-tap"}`;

  return (
    <div className="mx-auto max-w-6xl pb-20 space-y-5">
      {/* ── THANH NỔI LƯU THAY ĐỔI ── */}
      <UnsavedChangesBar
        visible={form.isDirty}
        saving={form.saveMut.isPending}
        onSave={form.submit}
        onDiscard={form.discardChanges}
      />

      {/* ── HEADER ── */}
      <CollectionDetailHeader
        title={form.title}
        status={form.status}
        isBase={isBase}
        totalItemsCount={totalItemsCount}
        mode={form.mode}
        liveCollectionUrl={liveCollectionUrl}
        isDirty={form.isDirty}
        isSaving={form.saveMut.isPending}
        onBack={onBack}
        onPreview={() => form.setPreviewOpen(true)}
        onDiscard={form.discardChanges}
        onSave={form.submit}
      />

      {/* Thông báo lỗi thao tác nếu có */}
      {form.formError && (
        <div className="rounded-xl border border-[#e3b3b3] bg-[#fdf3f3] p-4 text-sm font-medium text-[#c0392b] shadow-xs">
          ⚠️ {form.formError}
        </div>
      )}

      {/* ── BỐ CỤC 2 CỘT NỘI DUNG CHÍNH ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CỘT TRÁI (2/3): THÔNG TIN, LOẠI BỘ & DANH SÁCH MẪU XE */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Tên & Mô tả bộ sưu tập */}
          <CollectionDetailBasicInfo
            title={form.title}
            setTitle={form.setTitle}
            description={form.description}
            setDescription={form.setDescription}
            descPreview={form.descPreview}
            setDescPreview={form.setDescPreview}
            descRef={form.descRef}
          />

          {/* Card 2: Chế độ gom sản phẩm & Thiết lập điều kiện tự động */}
          <CollectionDetailModeSection
            isBase={isBase}
            mode={form.mode}
            setMode={form.setMode}
            conditions={form.conditions}
            setConditions={form.setConditions}
            matchMode={form.matchMode}
            setMatchMode={form.setMatchMode}
            setCondition={form.setCondition}
            catalog={catalog}
            allTags={form.allTags}
          />

          {/* Card 3: Danh sách & Chọn sản phẩm */}
          <CollectionProductList
            mode={form.mode}
            sortKey={form.sortKey}
            onSortChange={form.setSortKey}
            products={products}
            manualIds={form.manualIds}
            onAddManual={(id) => form.setManualIds((ids) => [...ids, id])}
            onRemoveManual={(id) =>
              form.setManualIds((ids) => ids.filter((x) => x !== id))
            }
            onBulkRemove={(ids) =>
              form.setManualIds((prev) => prev.filter((x) => !ids.includes(x)))
            }
            onMoveManual={form.moveManual}
            onOpenProduct={onOpenProduct}
            displayedProducts={form.displayedProducts}
            sortedProducts={form.sortedProducts}
            positionIndexOf={form.positionIndexOf}
            autoMatchedCount={form.autoMatched.length}
            matchMode={form.matchMode}
            title={form.title}
          />

          {/* Card 4: Tối ưu SEO & Handle truy cập */}
          <CollectionSeoSection
            title={form.title}
            description={form.description}
            slug={form.slug}
            seoTitle={form.seoTitle}
            seoDescription={form.seoDescription}
            seoOpen={form.seoOpen}
            onToggleSeo={() => form.setSeoOpen((v) => !v)}
            onChangeSeoTitle={form.setSeoTitle}
            onChangeSeoDesc={form.setSeoDescription}
            onChangeSlug={form.setSlug}
          />
        </div>

        {/* CỘT PHẢI (1/3): TRẠNG THÁI & ẢNH ĐẠI DIỆN */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card 1: Trạng thái hiển thị */}
          <CollectionDetailStatsCard
            status={form.status}
            setStatus={form.setStatus}
            visibleOnList={form.visibleOnList}
            setVisibleOnList={form.setVisibleOnList}
            totalItemsCount={totalItemsCount}
            totalStockCount={totalStockCount}
            priceRange={priceRange}
          />

          {/* Card 2: Ảnh đại diện bộ sưu tập */}
          <CollectionImageSection
            title={form.title}
            imageKey={form.imageKey}
            imageName={form.imageName}
            imageError={form.imageError}
            onImageFile={(f) => void form.onImageFile(f)}
            onRemoveImage={() => {
              form.setImageKey("");
              form.setImageName("");
              form.setImageError(null);
            }}
          />
        </div>
      </div>

      {/* ── FOOTER HÀNH ĐỘNG CUỐI TRANG ── */}
      <CollectionDetailFooter
        isBase={isBase}
        confirmDelete={form.confirmDelete}
        setConfirmDelete={form.setConfirmDelete}
        isDeleting={form.deleteMut.isPending}
        isSaving={form.saveMut.isPending}
        onDelete={() => form.deleteMut.mutate()}
        onBack={onBack}
        onSave={form.submit}
      />

      {/* Popup Xem trước Modal */}
      {form.previewOpen && (
        <CollectionPreviewModal
          title={form.title}
          imageKey={form.imageKey}
          description={form.description}
          displayedProducts={form.displayedProducts}
          visibleOnList={form.visibleOnList}
          rowNav={row.nav}
          onViewNav={onViewNav}
          onClose={() => form.setPreviewOpen(false)}
        />
      )}

      {/* Modal xác nhận lưu trùng tỉ lệ */}
      <CollectionDetailDuplicateModal
        duplicatePrompt={form.duplicatePrompt}
        onCancel={form.cancelDuplicateSave}
        onConfirm={form.confirmDuplicateSave}
        isSaving={form.saveMut.isPending}
      />
    </div>
  );
}
