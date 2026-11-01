import { z } from "../space";

export const adminVariantOut = z.object({
  id: z.number(),
  colorName: z.string(),
  price: z.number(),
  promoPrice: z.number().nullable(),
  stock: z.number(),
  imageKey: z.string(),
  sortOrder: z.number(),
  sku: z.string().nullable(),
  skuStatus: z.string(),
  internalCode: z.string().nullable(),
  costPrice: z.number().nullable(),
  barcode: z.string(),
  variantTag: z.string(),
  weightGrams: z.number().nullable(),
});

export const adminProductOut = z.object({
  id: z.number(),
  name: z.string(),
  brand: z.string(),
  scale: z.string(),
  vehicleType: z.string(),
  description: z.string(),
  features: z.string(),
  isFeatured: z.boolean(),
  modelMaker: z.string().nullable(),
  sku: z.string().nullable(),
  skuStatus: z.string(),
  internalCode: z.string().nullable(),
  inventoryPolicy: z.string(),
  createdAt: z.string(),
  slug: z.string().default(""),
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
  totalSold: z.number().default(0),
  variants: z.array(adminVariantOut),
  images: z.array(
    z.object({ imageKey: z.string(), variantId: z.number().nullable() }),
  ),
});

export const adminOrderItemOut = z.object({
  id: z.number(),
  productId: z.number(),
  variantId: z.number().nullable(),
  colorName: z.string(),
  productName: z.string(),
  scale: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
  productSku: z.string().nullable(),
  variantSku: z.string().nullable(),
});

export const adminOrderOut = z.object({
  id: z.number(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerAddress: z.string(),
  note: z.string(),
  paymentMethod: z.string(),
  status: z.string(),
  subtotalBeforeBulk: z.number(),
  bulkPct: z.number(),
  bulkDiscountAmount: z.number(),
  subtotal: z.number(),
  discountCode: z.string().nullable(),
  discountAmount: z.number(),
  subtotalAfterCoupon: z.number(),
  shippingFee: z.number(),
  total: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  confirmedAt: z.string().nullable().optional(),
  doneAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  items: z.array(adminOrderItemOut),
});

export const discountOut = z.object({
  id: z.number(),
  code: z.string(),
  kind: z.string(),
  value: z.number(),
  isActive: z.boolean(),
  note: z.string(),
  createdAt: z.string(),
});

export const okErrorOut = z.object({
  ok: z.boolean(),
  error: z.string().nullable(),
});

export const productInput = z.object({
  id: z.number().int().positive().nullable().default(null),
  name: z.string().min(2).max(160),
  brand: z.string().min(1).max(80),
  scale: z.string().min(1).max(20),
  vehicleType: z.string().max(80).default(""),
  description: z.string().max(4000).default(""),
  features: z.string().max(1000).default(""),
  isFeatured: z.boolean().default(false),
  modelMaker: z.string().max(60).default(""),
  inventoryPolicy: z.enum(["track_stop", "no_track"]).optional(),
  slug: z.string().max(200).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(1000).optional(),
  variants: z
    .array(
      z.object({
        id: z.number().int().positive().nullable().default(null),
        colorName: z.string().min(1).max(120),
        price: z.number().int().min(0),
        promoPrice: z.number().int().min(0).nullable().default(null),
        stock: z.number().int().min(0),
        imageKey: z.string().min(1).max(1500000),
        costPrice: z.number().int().min(0).nullable().optional(),
        barcode: z.string().max(64).optional(),
        variantTag: z.string().max(120).optional(),
        weightGrams: z.number().int().min(0).nullable().optional(),
      }),
    )
    .min(1)
    .max(12),
});

export const adminProductsPaginatedOut = z.object({
  products: z.array(adminProductOut),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  counts: z.object({
    all: z.number(),
    in: z.number(),
    out: z.number(),
    bestSelling: z.number().optional(),
  }),
});

export const adminInventoryPaginatedOut = z.object({
  rows: z.array(
    z.object({
      product: adminProductOut,
      variant: adminVariantOut,
    }),
  ),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  counts: z.object({
    all: z.number(),
    in: z.number(),
    low: z.number(),
    out: z.number(),
  }),
});

export const adminOrdersPaginatedOut = z.object({
  orders: z.array(adminOrderOut),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  counts: z.object({
    all: z.number(),
    open: z.number(),
    hold: z.number(),
    closed: z.number(),
  }),
});
