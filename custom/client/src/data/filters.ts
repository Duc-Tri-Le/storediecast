export type SortKey = "featured" | "az" | "za" | "priceAsc" | "priceDesc";

export const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "Nổi bật" },
  { key: "az", label: "Từ A → Z" },
  { key: "za", label: "Từ Z → A" },
  { key: "priceAsc", label: "Giá thấp → cao" },
  { key: "priceDesc", label: "Giá cao → thấp" },
];

export type PriceRangeKey =
  | "all"
  | "under100"
  | "from100to300"
  | "from300to500"
  | "from500to1m"
  | "over1m";

export const PRICE_RANGES: Array<{
  key: PriceRangeKey;
  label: string;
  min: number | null;
  max: number | null;
  test: (price: number) => boolean;
}> = [
  { key: "all", label: "Tất cả", min: null, max: null, test: () => true },
  { key: "under100", label: "Dưới 100k", min: null, max: 100_000, test: (p) => p < 100_000 },
  {
    key: "from100to300",
    label: "Từ 100k đến 300k",
    min: 100_000,
    max: 300_000,
    test: (p) => p >= 100_000 && p < 300_000,
  },
  {
    key: "from300to500",
    label: "Từ 300k đến 500k",
    min: 300_000,
    max: 500_000,
    test: (p) => p >= 300_000 && p < 500_000,
  },
  {
    key: "from500to1m",
    label: "Từ 500k đến 1 triệu",
    min: 500_000,
    max: 1_000_000,
    test: (p) => p >= 500_000 && p < 1_000_000,
  },
  { key: "over1m", label: "Trên 1 triệu", min: 1_000_000, max: null, test: (p) => p >= 1_000_000 },
];

export type SideSectionKey = "scale" | "brand" | "vehicle" | "price" | "hot" | "sale";


