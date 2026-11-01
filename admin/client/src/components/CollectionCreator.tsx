import type { Product, CatalogData } from "../types";
import type { CollectionStatus } from "../utils/collectionRules";
import {
  BackButton,
  UnsavedChangesBar,
  cardCls,
  smallBtn,
} from "./shared";
import { ConditionsBuilder } from "./ConditionsEditor";
import { CollectionCreatorPreviewTable } from "./CollectionCreatorPreviewTable";
import { CollectionCreatorSeoSection } from "./CollectionCreatorSeoSection";
import { CollectionCreatorImageSection } from "./CollectionCreatorImageSection";
import { CollectionCreatorDuplicateModal } from "./CollectionCreatorDuplicateModal";
import { CollectionCreatorManualPicker } from "./CollectionCreatorManualPicker";
import { useCollectionCreatorForm } from "../hooks/useCollectionCreatorForm";
import { CollectionCreatorBasicInfo } from "./CollectionCreatorBasicInfo";

export function CollectionCreator({
  products,
  catalog,
  onClose,
  onCreated,
}: {
  products: Product[];
  catalog: CatalogData | null;
  onClose: () => void;
  onCreated: (c: { id: number; title: string; status: CollectionStatus }) => void;
}) {
  const form = useCollectionCreatorForm({
    products,
    onCreated,
  });

  return (
    <div className="pb-16">
      {/* ── BREADCRUMB & HEADER ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <BackButton label="Bộ sưu tập" onClick={onClose} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text)]">
            Tạo bộ sưu tập mới
          </h1>
          <p className="mt-0.5 text-xs text-[var(--dim)]">
            Nhóm các sản phẩm mô hình theo chủ đề, tỉ lệ hoặc thương hiệu để hiển thị trên web bán hàng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={form.createMut.isPending}
            className={smallBtn}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={form.createMut.isPending}
            onClick={form.submit}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-dark)] disabled:opacity-50"
          >
            {form.createMut.isPending ? "Đang lưu…" : "Lưu bộ sưu tập"}
          </button>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {form.formError && (
        <div className="mb-6 rounded-xl border border-[#e3b3b3] bg-[#fdf3f3] p-4 text-sm font-medium text-[#c0392b] shadow-xs">
          ⚠️ {form.formError}
        </div>
      )}

      {/* Thanh cảnh báo thay đổi chưa lưu */}
      <UnsavedChangesBar
        visible={form.isDirty}
        saving={form.createMut.isPending}
        onSave={form.submit}
        onDiscard={onClose}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── CỘT TRÁI (NỘI DUNG CHÍNH) ── */}
        <div className="space-y-6 lg:col-span-2">
          <CollectionCreatorBasicInfo
            title={form.title}
            setTitle={form.setTitle}
            description={form.description}
            setDescription={form.setDescription}
            descRef={form.descRef}
            mode={form.mode}
            setMode={form.setMode}
          />

          {/* Chi tiết cho chế độ TỰ ĐỘNG hoặc THỦ CÔNG */}
          {form.mode === "auto" && (
            <section className={`${cardCls} p-5 space-y-4`} aria-label="Điều kiện tự động">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[var(--text)]">Điều kiện tự động</h3>
                <div className="text-xs font-medium">
                  {form.validConditions.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf9f2] px-3 py-1 text-[#14663c]">
                      <span className="h-2 w-2 rounded-full bg-[#14663c]" />
                      Đang khớp <strong>{form.autoMatchedProducts.length}</strong> sản phẩm
                    </span>
                  ) : (
                    <span className="text-[var(--dim)]">Chưa nhập giá trị điều kiện nào</span>
                  )}
                </div>
              </div>

              <ConditionsBuilder
                conditions={form.conditions}
                matchMode={form.matchMode}
                onChangeMatchMode={form.setMatchMode}
                onChangeCondition={form.setCondition}
                onAddCondition={() =>
                  form.setConditions((cs) => [
                    ...cs,
                    { kind: "scale", operator: "eq", value: "" },
                  ])
                }
                onRemoveCondition={(i) =>
                  form.setConditions((cs) => cs.filter((_, idx) => idx !== i))
                }
                catalog={catalog}
                allTags={form.allTags}
                showMatchMode={true}
                addLabel="Thêm điều kiện khác"
              />
            </section>
          )}

          {/* Chọn mẫu xe thủ công */}
          {form.mode === "manual" && (
            <CollectionCreatorManualPicker
              pickable={form.pickable}
              pickedIds={form.pickedIds}
              pickSearch={form.pickSearch}
              setPickSearch={form.setPickSearch}
              setPickedIds={form.setPickedIds}
            />
          )}

          {/* Bảng xem trước danh sách sản phẩm trong bộ sưu tập */}
          <CollectionCreatorPreviewTable
            previewProducts={form.previewProducts}
          />

          {/* Cấu hình SEO */}
          <CollectionCreatorSeoSection
            title={form.title}
            description={form.description}
            seoOpen={form.seoOpen}
            setSeoOpen={form.setSeoOpen}
            seoTitle={form.seoTitle}
            setSeoTitle={form.setSeoTitle}
            seoDescription={form.seoDescription}
            setSeoDescription={form.setSeoDescription}
            customSlug={form.customSlug}
            setCustomSlug={form.setCustomSlug}
            slug={form.slug}
          />
        </div>

        {/* ── CỘT PHẢI (SIDEBAR THIẾT LẬP) ── */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card: Trạng thái hiển thị */}
          <section className={`${cardCls} p-5 space-y-4`} aria-label="Trạng thái bộ sưu tập">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--dim)]">
              Trạng thái & Hiển thị
            </h2>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1 block">
                Trạng thái phát hành
              </label>
              <select
                value={form.status}
                onChange={(e) => form.setStatus(e.target.value as CollectionStatus)}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[var(--accent)]"
              >
                <option value="published">Đang hoạt động (Published)</option>
                <option value="draft">Bản nháp (Draft)</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 pt-2 text-xs">
              <input
                type="checkbox"
                checked={form.visibleOnList}
                onChange={(e) => form.setVisibleOnList(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)]"
              />
              <span className="text-[var(--text)]">
                Hiện trên menu & danh sách bộ sưu tập ở trang chủ web bán hàng
              </span>
            </label>
          </section>

          {/* Card: Ảnh đại diện */}
          <CollectionCreatorImageSection
            title={form.title}
            imageKey={form.imageKey}
            imageName={form.imageName}
            imageError={form.imageError}
            setImageKey={form.setImageKey}
            setImageName={form.setImageName}
            onFileSelect={form.handleImageFile}
          />
        </div>
      </div>

      {/* Modal cảnh báo trùng lặp */}
      <CollectionCreatorDuplicateModal
        duplicatePrompt={form.duplicatePrompt}
        onCancel={() => form.setDuplicatePrompt(null)}
        onConfirm={() => {
          form.setDuplicatePrompt(null);
          form.performSave();
        }}
        isPending={form.createMut.isPending}
      />
    </div>
  );
}
