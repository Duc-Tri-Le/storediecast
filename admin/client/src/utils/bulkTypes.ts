import type { ConditionKind } from "./collectionRules";
import { fmtVND } from "./format";

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
  if (a.mode === "clear") return `${label}: Xóa giá khuyến mãi`;
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
  "rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]";
