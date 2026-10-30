import type { Product } from "../types";
import type {
  CollectionKind,
  CollectionStatus,
  CollectionCondition,
  MatchMode,
} from "./collectionRules";
import { defaultVariant } from "./format";
import type { CollectionSortKey } from "../components/CollectionProductList";

export type CollectionFormShape = {
  title: string;
  description: string;
  conditions: CollectionCondition[];
  matchMode: MatchMode;
  mode: CollectionKind;
  manualIds: number[];
  sortKey: CollectionSortKey;
  status: CollectionStatus;
  visibleOnList: boolean;
  imageKey: string;
  seoTitle: string;
  seoDescription: string;
};

export function shapeOfCollectionForm(s: CollectionFormShape): string {
  return JSON.stringify({
    title: s.title.trim(),
    description: s.description,
    conditions: s.conditions.map((c) => ({
      kind: c.kind,
      operator: c.operator,
      value: c.value,
    })),
    matchMode: s.matchMode,
    mode: s.mode,
    manualIds: s.manualIds,
    sortKey: s.sortKey,
    status: s.status,
    visibleOnList: s.visibleOnList,
    imageKey: s.imageKey,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
  });
}

export function sortCollectionProducts(
  products: Product[],
  sortKey: CollectionSortKey,
): Product[] {
  if (sortKey === "manual") return products;
  const priceOf = (p: Product) =>
    defaultVariant(p)?.promoPrice ?? defaultVariant(p)?.price ?? 0;
  const list = [...products];
  switch (sortKey) {
    case "titleAsc":
      list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
      break;
    case "titleDesc":
      list.sort((a, b) => b.name.localeCompare(a.name, "vi"));
      break;
    case "priceDesc":
      list.sort((a, b) => priceOf(b) - priceOf(a));
      break;
    case "priceAsc":
      list.sort((a, b) => priceOf(a) - priceOf(b));
      break;
    case "newest":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "oldest":
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
  }
  return list;
}

