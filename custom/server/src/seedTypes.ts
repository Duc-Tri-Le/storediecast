export interface SampleItem {
  name: string;
  brand: string;
  scale: "1:64" | "1:32" | "1:16";
  colorName: string;
  price: number;
  promoPrice: number | null;
  stock: number;
  description: string;
  features: string;
  imageKey: string;
  isFeatured: number;
}

