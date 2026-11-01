import type { DraftVariant } from "../utils/productFormTypes";
import { VariantImagePicker } from "./VariantImagePicker";
import {
  getColorNameError,
  getPriceError,
  getPromoPriceError,
  getStockError,
} from "../utils/productValidation";

export interface ProductVariantEditModalProps {
  editingIndex: number | null;
  editingVariant: DraftVariant | null;
  variantsCount: number;
  imageKeys: string[];
  onClose: () => void;
  onSetVariant: (patch: Partial<DraftVariant>) => void;
  onRemoveVariant: () => void;
}

export function ProductVariantEditModal({
  editingIndex,
  editingVariant,
  variantsCount,
  imageKeys,
  onClose,
  onSetVariant,
  onRemoveVariant,
}: ProductVariantEditModalProps) {
  if (editingIndex === null || !editingVariant) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[var(--text)]">
              Chỉnh sửa biến thể
            </h3>
            <p className="text-xs text-[var(--dim)]">
              {editingVariant.colorName
                ? `Đang chỉnh sửa: ${editingVariant.colorName}`
                : `Biến thể mới #${editingIndex + 1}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--dim)] hover:bg-[var(--sidebar)] hover:text-[var(--text)] transition"
          >
            ✕
          </button>
        </div>

        {/* Các trường nhập liệu trong modal */}
        <div className="space-y-4">
          {/* Tên màu */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[var(--dim)] uppercase">
                Tên màu <span className="text-[#c0392b]">*</span>
              </label>
              {getColorNameError(editingVariant.colorName) && (
                <span className="text-[11px] font-semibold text-[#c0392b]">
                  {getColorNameError(editingVariant.colorName)}
                </span>
              )}
            </div>
            <input
              type="text"
              value={editingVariant.colorName}
              onChange={(e) => onSetVariant({ colorName: e.target.value })}
              placeholder="VD: Đỏ Red, Trắng Pearl, Xanh GP..."
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition ${
                getColorNameError(editingVariant.colorName)
                  ? "border-[#c0392b] bg-[#fff8f8]"
                  : "border-[var(--border)] focus:border-[var(--accent)]"
              }`}
            />
          </div>

          {/* Grid 3 cột: Giá niêm yết, Giá KM, Tồn kho */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Giá niêm yết */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--dim)] uppercase">
                  Giá niêm yết <span className="text-[#c0392b]">*</span>
                </label>
              </div>
              {getPriceError(editingVariant.price) && (
                <span className="block text-[10px] font-semibold text-[#c0392b] mb-1 truncate">
                  {getPriceError(editingVariant.price)}
                </span>
              )}
              <input
                type="text"
                inputMode="numeric"
                value={editingVariant.price}
                onChange={(e) => onSetVariant({ price: e.target.value })}
                placeholder="1550000"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold outline-none transition ${
                  getPriceError(editingVariant.price)
                    ? "border-[#c0392b] bg-[#fff8f8]"
                    : "border-[var(--border)] focus:border-[var(--accent)]"
                }`}
              />
            </div>

            {/* Giá KM */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--dim)] uppercase">
                  Giá KM
                </label>
              </div>
              {getPromoPriceError(editingVariant.promoPrice, editingVariant.price) && (
                <span className="block text-[10px] font-semibold text-[#c0392b] mb-1 truncate">
                  {getPromoPriceError(editingVariant.promoPrice, editingVariant.price)}
                </span>
              )}
              <input
                type="text"
                inputMode="numeric"
                value={editingVariant.promoPrice}
                onChange={(e) => onSetVariant({ promoPrice: e.target.value })}
                placeholder="Trống = không"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition ${
                  getPromoPriceError(editingVariant.promoPrice, editingVariant.price)
                    ? "border-[#c0392b] bg-[#fff8f8]"
                    : "border-[var(--border)] focus:border-[var(--accent)]"
                }`}
              />
            </div>

            {/* Tồn kho */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--dim)] uppercase">
                  Tồn kho <span className="text-[#c0392b]">*</span>
                </label>
              </div>
              {getStockError(editingVariant.stock) && (
                <span className="block text-[10px] font-semibold text-[#c0392b] mb-1 truncate">
                  {getStockError(editingVariant.stock)}
                </span>
              )}
              <input
                type="text"
                inputMode="numeric"
                value={editingVariant.stock}
                onChange={(e) => onSetVariant({ stock: e.target.value })}
                placeholder="0"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-center outline-none transition ${
                  getStockError(editingVariant.stock)
                    ? "border-[#c0392b] bg-[#fff8f8]"
                    : "border-[var(--border)] focus:border-[var(--accent)]"
                }`}
              />
            </div>
          </div>

          {/* SKU */}
          {editingVariant.sku && (
            <div className="text-xs text-[var(--dim)] font-mono">
              Mã SKU: <span className="font-semibold">{editingVariant.sku}</span>
            </div>
          )}

          {/* Ảnh đại diện biến thể */}
          <div className="pt-3 border-t border-[var(--border)]">
            <label className="block text-xs font-semibold text-[var(--dim)] uppercase mb-2">
              Ảnh đại diện cho màu này
            </label>
            <VariantImagePicker
              v={editingVariant}
              imageKeys={imageKeys}
              idPrefix={`modal-picker-${editingIndex}`}
              onChange={onSetVariant}
            />
          </div>
        </div>

        {/* Footer hành động */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          {variantsCount > 1 ? (
            <button
              type="button"
              onClick={onRemoveVariant}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-[#c0392b] hover:bg-[#fff0f0] transition"
            >
              🗑️ Xóa màu này
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--accent-dark)] transition"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}

