import type { Product, ShopCollection, CatalogData } from "../types";
import type {
  CollectionRow,
  CollectionNav,
} from "../utils/collectionRules";
import {
  Icon,
  cardCls,
  labelCls,
  inputCls,
  smallBtn,
  UnsavedChangesBar,
} from "../components/shared";
import { renderRichText } from "../components/VariantImagePicker";
import {
  CollectionProductList,
} from "../components/CollectionProductList";
import {
  CollectionConditionsSection,
  CollectionSeoSection,
  CollectionImageSection,
  CollectionPreviewModal,
} from "../components/CollectionDetailSections";
import { useCollectionDetailForm } from "../hooks/useCollectionDetailForm";

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

  const toolBtn =
    "rounded-md border border-[var(--border)] bg-white px-2 py-1 text-sm hover:bg-[var(--sidebar)]";
  const selectCls =
    "rounded-lg border border-[var(--border)] bg-white px-2 py-2 text-sm outline-none focus:border-[var(--accent)]";

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
        aria-label="Quay lại Bộ sưu tập"
        className="inline-flex items-center gap-1 rounded-md bg-[var(--sidebar)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--dim)] uppercase hover:text-[var(--text)]"
      >
        ‹ Bộ sưu tập
      </button>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{form.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={form.toggleStatusMut.isPending}
          onClick={() =>
            form.toggleStatusMut.mutate(
              form.status === "published" ? "draft" : "published",
            )
          }
          className={`${smallBtn} inline-flex items-center gap-1.5`}
        >
          {form.status === "published" ? "Tắt bộ sưu tập" : "Bật bộ sưu tập"}
        </button>
        <button
          type="button"
          onClick={() => form.setPreviewOpen(true)}
          className={`${smallBtn} inline-flex items-center gap-1.5`}
        >
          <Icon
            d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"
            size={16}
          />
          Xem
        </button>
        <span className="flex-1" />
        {form.status === "published" ? (
          <span className="inline-block rounded bg-[#dcf2e3] px-3 py-1 text-xs font-semibold text-[#14663c]">
            Đang hoạt động
          </span>
        ) : (
          <span className="inline-block rounded bg-[#e9f1f9] px-3 py-1 text-xs font-semibold text-[#47617c]">
            Đã tắt
          </span>
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
      {isBase && (
        <p className="mt-4 rounded-lg bg-[#fdf6e0] px-4 py-3 text-sm text-[#7a5b00]">
          Đây là bộ theo tỉ lệ — một trong 3 bộ gốc đang hiện trên web khách. Điều kiện, chế
          độ gom, mô tả, ảnh, hiển thị và SEO đều sửa và lưu được như mọi bộ khác; riêng
          việc xóa bộ này thì không được phép. Nếu đổi tỉ lệ sang tỉ lệ đã có bộ gốc khác,
          lúc lưu sẽ báo rõ trùng và không lưu.
        </p>
      )}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className={cardCls} aria-label="Tiêu đề và mô tả bộ sưu tập">
            <label className={labelCls} htmlFor="cd-title">
              Tiêu đề
            </label>
            <input
              id="cd-title"
              className={inputCls}
              value={form.title}
              maxLength={120}
              onChange={(e) => form.setTitle(e.target.value)}
            />
            <label className={labelCls} htmlFor="cd-desc">
              Mô tả (tùy chọn)
            </label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Định dạng mô tả">
              <button
                type="button"
                className={toolBtn}
                aria-label="In đậm"
                onClick={() => form.wrapSelection("**", "**")}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className={toolBtn}
                aria-label="In nghiêng"
                onClick={() => form.wrapSelection("*", "*")}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                className={toolBtn}
                aria-label="Gạch chân"
                onClick={() => form.wrapSelection("__", "__")}
              >
                <u>U</u>
              </button>
              <button
                type="button"
                className={toolBtn}
                onClick={() =>
                  form.setDescription((d) => (d ? `${d}\n• ` : "• "))
                }
              >
                • Danh sách
              </button>
              <button
                type="button"
                className={toolBtn}
                aria-pressed={form.descPreview}
                onClick={() => form.setDescPreview((v) => !v)}
              >
                {form.descPreview ? "Soạn thảo" : "Xem trước"}
              </button>
            </div>
            {form.descPreview ? (
              <div className="mt-2 min-h-24 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                {form.description.trim() ? (
                  renderRichText(form.description)
                ) : (
                  <p className="text-[var(--dim)]">Chưa có mô tả.</p>
                )}
              </div>
            ) : (
              <textarea
                id="cd-desc"
                ref={form.descRef}
                className={`${inputCls} mt-2 min-h-24`}
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                placeholder="Mô tả bộ sưu tập này cho khách xem…"
              />
            )}
          </section>

          <CollectionConditionsSection
            conditions={form.conditions}
            matchMode={form.matchMode}
            onChangeMatchMode={form.setMatchMode}
            onChangeCondition={form.setCondition}
            onAddCondition={() =>
              form.setConditions((cs) => [
                ...cs,
                { kind: "brand", operator: "eq", value: "" },
              ])
            }
            onRemoveCondition={(i) =>
              form.setConditions((cs) => cs.filter((_, idx) => idx !== i))
            }
            catalog={catalog}
            allTags={form.allTags}
          />

          <section className={cardCls} aria-label="Sản phẩm trong bộ sưu tập">
            <h2 className="text-base font-bold">Sản phẩm</h2>
            <label className="sr-only" htmlFor="cd-mode">
              Chế độ gom sản phẩm
            </label>
            <select
              id="cd-mode"
              className={`${selectCls} mt-2 w-full`}
              value={form.mode}
              onChange={(e) => form.setMode(e.target.value as any)}
            >
              <option value="manual">Thủ công</option>
              <option value="auto">Tự động</option>
            </select>

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
          </section>

          <CollectionSeoSection
            title={form.title}
            description={form.description}
            seoTitle={form.seoTitle}
            seoDescription={form.seoDescription}
            seoOpen={form.seoOpen}
            onToggleSeo={() => form.setSeoOpen((v) => !v)}
            onChangeSeoTitle={form.setSeoTitle}
            onChangeSeoDesc={form.setSeoDescription}
          />
        </div>

        <div className="space-y-4">
          <section className={cardCls} aria-label="Hiển thị bộ sưu tập">
            <h2 className="text-base font-bold">Hiển thị bộ sưu tập</h2>
            <p className="mt-1 text-sm text-[var(--dim)]">
              Quản lý việc bộ sưu tập này có hiện trên trang Bộ sưu tập của web khách hay
              không.
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.visibleOnList}
                onChange={(e) => form.setVisibleOnList(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span>
                <span className="font-medium">Hiện trên trang Bộ sưu tập của web khách</span>
                <span className="block text-xs text-[var(--dim)]">
                  Bộ sưu tập này sẽ hiện trong danh sách bộ sưu tập trên web bán hàng.
                </span>
              </span>
            </label>
          </section>

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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isBase ? (
          <span className="text-sm text-[var(--dim)]">
            Bộ theo tỉ lệ không được phép xóa.
          </span>
        ) : form.confirmDelete ? (
          <>
            <span className="text-sm text-[#9c2b2b]">
              Xóa hẳn bộ “{collection.title}” khỏi database chung? Sản phẩm trong bộ vẫn giữ
              nguyên, không hoàn tác được.
            </span>
            <button
              type="button"
              disabled={form.deleteMut.isPending}
              onClick={() => form.deleteMut.mutate()}
              className="rounded-lg bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Chắc chắn xóa
            </button>
            <button
              type="button"
              onClick={() => form.setConfirmDelete(false)}
              className={smallBtn}
            >
              Không xóa
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => form.setConfirmDelete(true)}
            className="rounded-lg bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white"
          >
            Xóa
          </button>
        )}
        <span className="flex-1" />
        <button type="button" onClick={onBack} className={smallBtn}>
          Hủy
        </button>
        <button
          type="button"
          disabled={form.saveMut.isPending}
          onClick={form.submit}
          className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] disabled:opacity-50"
        >
          {form.saveMut.isPending ? "Đang lưu…" : "Lưu"}
        </button>
      </div>

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
    </div>
  );
}
