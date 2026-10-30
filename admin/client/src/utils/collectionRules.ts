import type { Product, ShopCollection } from "../types";

export type CollectionKind = "auto" | "manual";
export type CollectionStatus = "published" | "draft";
export type ConditionKind = "scale" | "brand" | "vehicleType" | "modelMaker" | "tag";
export type ConditionOperator = "eq" | "neq" | "contains" | "notContains";
export type CollectionCondition = {
  kind: ConditionKind;
  operator: ConditionOperator;
  value: string;
};
export type MatchMode = "all" | "any";
export type CollectionNav = { kind: "scale" | "brand" | "vehicleType"; value: string };

export type CollectionRow = {
  id: string;
  title: string;
  kind: CollectionKind;
  status: CollectionStatus;
  createdAt: string;
  conditions: CollectionCondition[];
  matchMode: MatchMode;
  lines: string[];
  moreUnit: string;
  count: number;
  stock: number;
  fromPrice: number | null;
  soldQty: number;
  matched: Product[];
  isBase: boolean;
  nav: CollectionNav | null;
  custom: ShopCollection | null;
};

export const CONDITION_KIND_LABELS: Record<ConditionKind, string> = {
  scale: "Tỉ lệ",
  brand: "Hãng xe",
  vehicleType: "Loại xe",
  modelMaker: "Hãng mô hình",
  tag: "Thẻ",
};

export const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  eq: "bằng",
  neq: "không bằng",
  contains: "chứa",
  notContains: "không chứa",
};

/** Nhãn tiếng Anh cho ô chọn toán tử ở Chi tiết bộ sưu tập */
export const CONDITION_OPERATOR_LABELS_EN: Record<ConditionOperator, string> = {
  eq: "equals",
  neq: "not equals",
  contains: "contains",
  notContains: "not contains",
};

export function conditionLine(c: CollectionCondition): string {
  return `${CONDITION_KIND_LABELS[c.kind]} ${CONDITION_OPERATOR_LABELS[c.operator] ?? "bằng"} ${c.value}`;
}

export function productTags(p: Product): string[] {
  return (p.features ?? "")
    .split("·")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function productMatchesCondition(p: Product, c: CollectionCondition): boolean {
  const target = c.value.trim().toLowerCase();
  if (c.kind === "tag") {
    const tags = productTags(p).map((t) => t.toLowerCase());
    switch (c.operator) {
      case "neq":
        return !tags.some((t) => t === target);
      case "contains":
        return tags.some((t) => t.includes(target));
      case "notContains":
        return !tags.some((t) => t.includes(target));
      default:
        return tags.some((t) => t === target);
    }
  }
  const field = (
    c.kind === "scale"
      ? p.scale
      : c.kind === "brand"
        ? p.brand
        : c.kind === "vehicleType"
          ? p.vehicleType
          : (p.modelMaker ?? "")
  )
    .trim()
    .toLowerCase();
  switch (c.operator) {
    case "neq":
      return field !== target;
    case "contains":
      return field.includes(target);
    case "notContains":
      return !field.includes(target);
    default:
      return field === target;
  }
}

export function productMatchesConditions(
  p: Product,
  conditions: CollectionCondition[],
  matchMode: string,
): boolean {
  if (conditions.length === 0) return false;
  return matchMode === "all"
    ? conditions.every((c) => productMatchesCondition(p, c))
    : conditions.some((c) => productMatchesCondition(p, c));
}

export function minPriceOf(list: Product[]): number | null {
  const prices = list
    .flatMap((p) => p.variants.map((v) => v.promoPrice ?? v.price))
    .filter((x) => x > 0);
  return prices.length ? Math.min(...prices) : null;
}
