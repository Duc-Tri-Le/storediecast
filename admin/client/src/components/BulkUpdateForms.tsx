import type { Product } from "../types";
import type { CollectionCondition, ConditionKind, MatchMode } from "../utils/collectionRules";
import {
  CONDITION_KIND_LABELS,
  CONDITION_OPERATOR_LABELS_EN,
} from "../utils/collectionRules";
import { defaultVariant, fmtVND } from "../utils/format";
import { Icon, ICONS } from "./shared";

export type BulkActionType = "price" | "promoPrice" | "stock" | "description";
export type BulkMode = "set" | "add" | "subtract" | "percentAdd" | "percentSubtract" | "clear";
export type BulkActionDraft = { type: BulkActionType; mode: BulkMode; value: string; text: string };

export const BULK_ACTION_TYPE_LABELS: Record<BulkActionType, string> = {
  price: "Đổi giá bán",
  promoPrice: "Đổi giá khuyến mãi",
  stock: "Đổi tồn kho",
  description: "Đổi mô tả",
};

export const BULK_FIELD_ORDER: ConditionKind[] = ["vehicleType", "brand", "modelMaker", "scale", "tag"];

export function bulkModesFor(type: BulkActionType): Array<{ value: BulkMode; label: string }> {
  switch (type) {
    case "price":
      return [
        { value: "set", label: "Đặt thành" },
        { value: "add", label: "Cộng thêm" },
        { value: "subtract", label: "Trừ đi" },
        { value: "percentAdd", label: "Tăng theo %" },
        { value: "percentSubtract", label: "Giảm theo %" },
      ];
    case "promoPrice":
      return [
        { value: "set", label: "Đặt thành" },
        { value: "add", label: "Cộng thêm" },
        { value: "subtract", label: "Trừ đi" },
        { value: "percentAdd", label: "Tăng theo %" },
        { value: "percentSubtract", label: "Giảm theo %" },
        { value: "clear", label: "Xóa giá khuyến mãi" },
      ];
    case "stock":
      return [
        { value: "set", label: "Đặt thành" },
        { value: "add", label: "Cộng thêm" },
        { value: "subtract", label: "Trừ đi" },
      ];
    default:
      return [{ value: "set", label: "Đặt thành" }];
  }
}

export function bulkActionLine(a: { type: string; mode: string; value: number | null; text: string }): string {
  const type = (BULK_ACTION_TYPE_LABELS[a.type as BulkActionType] ? a.type : "price") as BulkActionType;
  const label = BULK_ACTION_TYPE_LABELS[type];
  if (type === "description") {
    const t = a.text.length > 120 ? `${a.text.slice(0, 120)}…` : a.text;
    return `${label}: “${t}”`;
  }
  if (a.mode === "clear") return `${label}: xóa giá khuyến mãi`;
  const modeLabel = bulkModesFor(type).find((m) => m.value === a.mode)?.label ?? a.mode;
  const v = a.value ?? 0;
  const valStr =
    a.mode === "percentAdd" || a.mode === "percentSubtract"
      ? `${v}%`
      : type === "stock"
        ? `${v} chiếc`
        : fmtVND(v);
  return `${label}: ${modeLabel} ${valStr}`;
}

export function bulkDraftActionLine(a: BulkActionDraft): string {
  return bulkActionLine({
    type: a.type,
    mode: a.mode,
    value: a.mode === "clear" ? null : Number(a.value),
    text: a.text,
  });
}

export const selectCls =
  "rounded-lg border border-[var(--border)] bg-white px-2.5 py-2 text-sm outline-none focus:border-[var(--accent)]";

export function BulkUpdatePreviewModal({
  matchMode,
  validConditions,
  variantMustMatch,
  bulkActions,
  matchedProducts,
  matchedVariantCount,
  onApply,
  onClose,
  isPending,
}: {
  matchMode: MatchMode;
  validConditions: CollectionCondition[];
  variantMustMatch: boolean;
  bulkActions: BulkActionDraft[];
  matchedProducts: Product[];
  matchedVariantCount: number;
  onApply: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#0a2c50]/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Xem trước cập nhật hàng loạt"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_24px_60px_-24px_rgba(10,44,80,0.45)]">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-xl font-bold tracking-tight">Xem trước cập nhật hàng loạt</h2>
          <button
            type="button"
            aria-label="Đóng xem trước cập nhật hàng loạt"
            disabled={isPending}
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-lg leading-none text-[var(--dim)] hover:bg-[var(--sidebar)] hover:text-[var(--text)] disabled:opacity-50"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          <p className="rounded-lg bg-[#eef3f8] px-4 py-3 text-sm leading-6">
            Danh sách dưới đây là các sản phẩm khớp theo các điều kiện ở phần Bộ lọc. Số
            sản phẩm được cập nhật thực tế có thể khác nhau tùy theo các hành động bạn
            muốn cập nhật.
          </p>

          <section aria-label="Bộ lọc xem trước" className="mt-5">
            <h3 className="text-base font-bold">Bộ lọc</h3>
            <p className="mt-2 text-sm">
              {matchMode === "all"
                ? "Sản phẩm khớp TẤT CẢ các điều kiện dưới đây:"
                : "Sản phẩm khớp BẤT KỲ điều kiện nào dưới đây:"}
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
              {validConditions.map((c, i) => (
                <li key={i}>
                  {CONDITION_KIND_LABELS[c.kind]}{" "}
                  {CONDITION_OPERATOR_LABELS_EN[c.operator]} “{c.value}”
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-[var(--dim)]">
              Cập nhật cho:{" "}
              {variantMustMatch
                ? "Biến thể khớp điều kiện"
                : "Tất cả biến thể của sản phẩm khớp"}
            </p>
          </section>

          <section
            aria-label="Hành động xem trước"
            className="mt-5 border-t border-[var(--border)] pt-4"
          >
            <h3 className="text-base font-bold">Hành động</h3>
            <p className="mt-2 text-sm">
              Các hành động dưới đây sẽ được thực hiện theo thứ tự từ trên xuống dưới:
            </p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm">
              {bulkActions.map((a, i) => (
                <li key={i}>{bulkDraftActionLine(a)}</li>
              ))}
            </ol>
          </section>

          <section
            aria-label="Sản phẩm khớp mẫu"
            className="mt-5 border-t border-[var(--border)] pt-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-bold">Sản phẩm khớp mẫu</h3>
              {matchedProducts.length > 0 && (
                <p className="text-sm text-[var(--dim)]">
                  {matchedProducts.length} sản phẩm · {matchedVariantCount} biến thể
                </p>
              )}
            </div>
            {matchedProducts.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="flex justify-center text-[#b9c9dc]">
                  <Icon d={ICONS.products} size={52} />
                </div>
                <p className="mt-3 text-lg font-bold">Không có sản phẩm nào khớp</p>
                <p className="mt-1 text-sm text-[var(--dim)]">
                  Thử thay đổi bộ lọc để khớp thêm sản phẩm.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-3 hidden overflow-hidden rounded-xl border border-[var(--border)] sm:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--table-head)] text-[var(--dim)]">
                        <th className="px-4 py-2.5 font-medium">Sản phẩm</th>
                        <th className="w-28 px-4 py-2.5 font-medium">Loại xe</th>
                        <th className="w-32 px-4 py-2.5 font-medium">Hãng xe</th>
                        <th className="w-20 px-4 py-2.5 font-medium">Tỉ lệ</th>
                        <th className="w-36 px-4 py-2.5 font-medium">Giá hiện tại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedProducts.map((p) => {
                        const dv = defaultVariant(p);
                        return (
                          <tr
                            key={p.id}
                            className="border-b border-[var(--border)] last:border-0 align-top"
                          >
                            <td className="px-4 py-2.5 font-medium">{p.name}</td>
                            <td className="px-4 py-2.5">{p.vehicleType}</td>
                            <td className="px-4 py-2.5">{p.brand}</td>
                            <td className="px-4 py-2.5">{p.scale}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              {dv ? (
                                dv.promoPrice != null ? (
                                  <>
                                    <span className="font-semibold">
                                      {fmtVND(dv.promoPrice)}
                                    </span>
                                    <span className="block text-xs text-[var(--dim)] line-through">
                                      {fmtVND(dv.price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-semibold">{fmtVND(dv.price)}</span>
                                )
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] sm:hidden">
                  {matchedProducts.map((p) => {
                    const dv = defaultVariant(p);
                    return (
                      <div key={p.id} className="px-4 py-3">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="mt-0.5 text-sm text-[var(--dim)]">
                          {p.vehicleType} · {p.brand} · Tỉ lệ {p.scale}
                        </p>
                        <p className="mt-0.5 text-sm">
                          Giá hiện tại:{" "}
                          {dv ? (
                            dv.promoPrice != null ? (
                              <>
                                <span className="font-semibold">
                                  {fmtVND(dv.promoPrice)}
                                </span>{" "}
                                <span className="text-xs text-[var(--dim)] line-through">
                                  {fmtVND(dv.price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-semibold">{fmtVND(dv.price)}</span>
                            )
                          ) : (
                            "—"
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--sidebar)] disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={matchedProducts.length === 0 || isPending}
            onClick={onApply}
            className="rounded-lg bg-[var(--accent)] transition-colors hover:bg-[var(--accent-dark)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Đang áp dụng…" : "Áp dụng cập nhật hàng loạt"}
          </button>
        </div>
      </div>
    </div>
  );
}
