import { defineAction, z } from "../space";
import { privileged } from "../privileged";
import {
  adminProductOut,
  adminProductsPaginatedOut,
  adminInventoryPaginatedOut,
  okErrorOut,
  productInput,
} from "../schemas/productSchemas";
import { callShop } from "../schemas/analyticsSchemas";

export const productActions = {
  adminListProductsPaginated: defineAction({
    request: z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(200).default(50),
      tab: z.enum(["all", "in", "out", "bestSelling"]).default("all"),
      scale: z.string().nullable().default(null),
      brand: z.string().nullable().default(null),
      vehicleType: z.string().nullable().default(null),
      search: z.string().default(""),
      sort: z
        .enum([
          "default",
          "nameAsc",
          "nameDesc",
          "priceAsc",
          "priceDesc",
          "bestSelling",
          "bestRevenue",
          "salesAsc",
        ])
        .default("default"),
    }),
    response: adminProductsPaginatedOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      return callShop(ctx, "listProductsPaginated", args);
    },
  }),

  adminListInventoryPaginated: defineAction({
    request: z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(200).default(50),
      filter: z.enum(["all", "in", "low", "out"]).default("all"),
      search: z.string().default(""),
      sortDir: z.enum(["asc", "desc"]).default("asc"),
    }),
    response: adminInventoryPaginatedOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      return callShop(ctx, "listInventoryPaginated", args);
    },
  }),
  adminListProducts: defineAction({
    request: z.object({}),
    response: z.object({ products: z.array(adminProductOut) }),
    privileged: [privileged.shopDb],
    async handler(ctx) {
      return callShop(ctx, "listProducts", {});
    },
  }),

  adminUpsertProduct: defineAction({
    request: productInput,
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      productId: z.number().nullable(),
    }),
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null; productId: number | null }>(
        ctx,
        "upsertProduct",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminImportProducts: defineAction({
    request: z.object({ items: z.array(productInput).min(1).max(200) }),
    response: z.object({
      results: z.array(
        z.object({
          ok: z.boolean(),
          error: z.string().nullable(),
          productId: z.number().nullable(),
        }),
      ),
    }),
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{
        results: Array<{ ok: boolean; error: string | null; productId: number | null }>;
      }>(ctx, "importProducts", args);
      ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminDeleteProduct: defineAction({
    request: z.object({ productId: z.number().int().positive() }),
    response: okErrorOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null }>(
        ctx,
        "deleteProduct",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminDeleteProductsBulk: defineAction({
    request: z.object({
      productIds: z.array(z.number().int().positive()).min(1).max(500),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      deleted: z.number(),
      deletedProducts: z.number(),
    }),
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{
        ok: boolean;
        error: string | null;
        deleted: number;
        deletedProducts: number;
      }>(ctx, "deleteProductsBulk", args);
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminDeleteVariants: defineAction({
    request: z.object({
      variantIds: z.array(z.number().int().positive()).min(1).max(1000),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      deleted: z.number(),
      deletedProducts: z.number(),
    }),
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{
        ok: boolean;
        error: string | null;
        deleted: number;
        deletedProducts: number;
      }>(ctx, "deleteVariantsBulk", args);
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),
};

