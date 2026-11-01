import { useState } from "react";
import type { DraftVariant } from "../utils/productFormTypes";
import { emptyDraftVariant } from "../utils/productFormTypes";
import { fmtVND } from "../utils/format";
import { DraftThumb } from "./VariantImagePicker";
import { ProductVariantEditModal } from "./ProductVariantEditModal";

export function ProductDetailVariantsSection({
  variants,
  imageKeys,
  setVariant,
  onAddVariant,
  onRemoveVariant,
}: {
  variants: DraftVariant[];
  imageKeys: string[];
  setVariant: (i: number, patch: Partial<DraftVariant>) => void;
  onAddVariant: (v: DraftVariant) => void;
  onRemoveVariant: (i: number) => void;
  setVariants?: React.Dispatch<React.SetStateAction<DraftVariant[]>>;
  dragVariantFrom?: number | null;
  dragVariantTarget?: number | null;
  variantCardsRef?: React.RefObject<(HTMLDivElement | null)[]>;
  onVariantHandleDown?: (e: React.PointerEvent<HTMLButtonElement>, i: number) => void;
  onVariantHandleMove?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  endVariantDrag?: (apply?: boolean) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const nextIdx = variants.length;
    onAddVariant(emptyDraftVariant());
    setEditingIndex(nextIdx);
  };

  const editingVariant = editingIndex !== null ? variants[editingIndex] ?? null : null;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xs"
      aria-label="Danh sách biến thể màu và giá bán"
    >
      {/* Header khối */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--table-head)] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[var(--text)]">Biến thể & Giá bán</h2>
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
              {variants.length} màu
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--dim)]">
            Bấm vào từng dòng để chỉnh sửa chi tiết tên màu, giá bán, tồn kho hoặc ảnh.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--accent-dark)]"
        >
          <span className="text-sm font-bold leading-none">+</span>
          <span>Thêm màu</span>
        </button>
      </div>

      {/* Bảng dữ liệu hiển thị Text thuần túy */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--sidebar)]/50 text-[var(--dim)] uppercase font-semibold tracking-wider text-[11px]">
              <th className="w-16 py-3.5 pl-5 pr-3">Ảnh</th>
              <th className="py-3.5 px-3">Tên màu</th>
              <th className="py-3.5 px-3">SKU</th>
              <th className="py-3.5 px-3 text-right">Giá niêm yết (₫)</th>
              <th className="py-3.5 px-3 text-right">Giá khuyến mãi (₫)</th>
              <th className="w-28 py-3.5 pl-3 pr-5 text-center">Tồn kho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {variants.map((v, i) => (
              <tr
                key={i}
                onClick={() => setEditingIndex(i)}
                className="group cursor-pointer transition-colors hover:bg-[var(--sidebar)]/40"
                title="Bấm vào để chỉnh sửa thông tin màu này"
              >
                {/* ẢNH */}
                <td className="py-3 pl-5 pr-3 align-middle">
                  <div className="relative inline-block rounded-md border border-[var(--border)] p-0.5 bg-white shadow-2xs group-hover:border-[var(--accent)]">
                    <DraftThumb v={v} size={40} />
                  </div>
                </td>

                {/* TÊN MÀU */}
                <td className="py-3 px-3 align-middle">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[var(--text)]">
                      {v.colorName || `Màu ${i + 1}`}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 text-[11px] text-[var(--accent)] font-semibold transition-opacity pr-2">
                      ✏️ Sửa
                    </span>
                  </div>
                </td>

                {/* SKU */}
                <td className="py-3 px-3 align-middle">
                  <span className="font-mono text-xs text-[var(--dim)]">
                    {v.sku || "— tự sinh —"}
                  </span>
                </td>

                {/* GIÁ NIÊM YẾT */}
                <td className="py-3 px-3 align-middle text-right">
                  <span className="font-semibold text-xs text-[var(--text)]">
                    {v.price ? fmtVND(Number(v.price) || 0) : "—"}
                  </span>
                </td>

                {/* GIÁ KHUYẾN MÃI */}
                <td className="py-3 px-3 align-middle text-right">
                  {v.promoPrice ? (
                    <span className="font-semibold text-xs text-[#137333]">
                      {fmtVND(Number(v.promoPrice) || 0)}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--dim)]">—</span>
                  )}
                </td>

                {/* TỒN KHO */}
                <td className="py-3 pl-3 pr-5 align-middle text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      Number(v.stock) > 0
                        ? "bg-[#e6f4ea] text-[#137333]"
                        : "bg-[#fce8e6] text-[#c5221f]"
                    }`}
                  >
                    {v.stock || "0"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal chỉnh sửa chi tiết biến thể */}
      <ProductVariantEditModal
        editingIndex={editingIndex}
        editingVariant={editingVariant}
        variantsCount={variants.length}
        imageKeys={imageKeys}
        onClose={() => setEditingIndex(null)}
        onSetVariant={(patch) => {
          if (editingIndex !== null) setVariant(editingIndex, patch);
        }}
        onRemoveVariant={() => {
          if (editingIndex !== null) {
            onRemoveVariant(editingIndex);
            setEditingIndex(null);
          }
        }}
      />
    </section>
  );
}
