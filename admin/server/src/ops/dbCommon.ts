import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export type Row = Record<string, unknown>;

export const num = (v: unknown): number => (typeof v === "number" ? v : Number(v ?? 0));
export const str = (v: unknown): string => (v == null ? "" : String(v));
export const nullableStr = (v: unknown): string | null => (v == null ? null : String(v));
export const nullableNum = (v: unknown): number | null => (v == null ? null : Number(v));
export const iso = (v: unknown): string => {
  if (typeof v === "string" && v.length >= 10) {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const n = num(v);
  const d = new Date(n > 0 ? n : Date.now());
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const fail = (error: string): Row => ({ ok: false, error, productId: null });

export function resolveSharedDbPath(): string {
  if (process.env.DB_PATH && existsSync(process.env.DB_PATH)) {
    return path.resolve(process.env.DB_PATH);
  }
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(currentDir, "..", "..", "..", "..", "data", "decast.db"),
    path.resolve(currentDir, "..", "..", "..", "data", "decast.db"),
    path.resolve(currentDir, "..", "..", "data", "decast.db"),
    path.resolve(currentDir, "..", "data", "decast.db"),
    path.resolve(process.cwd(), "data", "decast.db"),
    path.resolve(process.cwd(), "..", "data", "decast.db"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return path.resolve(process.cwd(), "data", "decast.db");
}

export const SHOP_DB_PATH = resolveSharedDbPath();

export type CatalogKind = "vehicleTypes" | "carBrands" | "modelMakers" | "scales";
export type CatalogEntry = { id: number; name: string; code: string | null };

export type VariantInput = {
  id: number | null;
  colorName: string;
  price: number;
  promoPrice: number | null;
  stock: number;
  imageKey: string;
  costPrice?: number | null;
  barcode?: string;
  variantTag?: string;
  weightGrams?: number | null;
};

export type ProductInput = {
  id: number | null;
  name: string;
  brand: string;
  scale: string;
  vehicleType?: string;
  description: string;
  features: string;
  isFeatured: boolean;
  modelMaker: string;
  inventoryPolicy?: string;
  variants: VariantInput[];
};

export type CollectionCondition = {
  kind: "scale" | "brand" | "vehicleType" | "modelMaker" | "tag";
  operator: "eq" | "neq" | "contains" | "notContains";
  value: string;
};

export type ThumbnailOption = { name: string; value: string };

export type BulkAction = {
  type: "price" | "promoPrice" | "stock" | "description";
  mode: "set" | "add" | "subtract" | "percentAdd" | "percentSubtract" | "clear";
  value?: number | null;
  text?: string;
};

