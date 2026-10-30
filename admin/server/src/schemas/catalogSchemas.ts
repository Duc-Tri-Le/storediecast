import { z } from "../space";

export const collectionConditionOut = z.object({
  kind: z.string(),
  operator: z.string(),
  value: z.string(),
});

export const collectionOut = z.object({
  id: z.number(),
  title: z.string(),
  status: z.string(),
  kind: z.string(),
  conditions: z.array(collectionConditionOut),
  description: z.string(),
  matchMode: z.string(),
  visible: z.boolean(),
  imageKey: z.string(),
  thumbnailConfig: z.array(
    z.array(z.object({ name: z.string(), value: z.string() })),
  ),
  seoTitle: z.string(),
  seoDescription: z.string(),
  baseScale: z.string().nullable(),
  productIds: z.array(z.number()),
  createdAt: z.string(),
});

export const collectionConditionIn = z.object({
  kind: z.enum(["scale", "brand", "vehicleType", "modelMaker", "tag"]),
  operator: z
    .enum(["eq", "neq", "contains", "notContains"])
    .default("eq"),
  value: z.string().min(1).max(120),
});

export const thumbnailConfigIn = z
  .array(
    z.array(
      z.object({
        name: z.string().max(60),
        value: z.string().max(120),
      }),
    ),
  )
  .max(10);

export const collectionWriteOut = z.object({
  ok: z.boolean(),
  error: z.string().nullable(),
  collectionId: z.number().nullable(),
});

export const catalogEntryOut = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  productCount: z.number(),
  collectionCount: z.number(),
});

export const catalogOut = z.object({
  vehicleTypes: z.array(catalogEntryOut),
  carBrands: z.array(catalogEntryOut),
  modelMakers: z.array(catalogEntryOut),
  scales: z.array(catalogEntryOut),
});

export const catalogKindSchema = z.enum([
  "vehicleTypes",
  "carBrands",
  "modelMakers",
  "scales",
]);

export const bulkActionOut = z.object({
  type: z.string(),
  mode: z.string(),
  value: z.number().nullable(),
  text: z.string(),
});

export const bulkUpdateOut = z.object({
  id: z.number(),
  conditions: z.array(collectionConditionOut),
  matchMode: z.string(),
  variantMustMatch: z.boolean(),
  actions: z.array(bulkActionOut),
  updatedProducts: z.number(),
  updatedVariants: z.number(),
  status: z.string(),
  createdAt: z.string(),
});

export const bulkUpdatesOut = z.object({
  updates: z.array(bulkUpdateOut),
});

export const bulkActionIn = z.object({
  type: z.enum(["price", "promoPrice", "stock", "description"]),
  mode: z
    .enum(["set", "add", "subtract", "percentAdd", "percentSubtract", "clear"])
    .default("set"),
  value: z.number().min(0).max(1000000000).nullable().optional(),
  text: z.string().max(5000).optional(),
});

export const bulkApplyOut = z.object({
  ok: z.boolean(),
  error: z.string().nullable(),
  updateId: z.number().nullable(),
  updatedProducts: z.number(),
  updatedVariants: z.number(),
});

