import { defineAction, z } from "../space";
import { privileged } from "../privileged";
import { okErrorOut } from "../schemas/productSchemas";
import { catalogKindSchema, catalogOut } from "../schemas/catalogSchemas";
import { callShop } from "../schemas/analyticsSchemas";

export const catalogActions = {
  adminListCatalog: defineAction({
    request: z.object({}),
    response: catalogOut,
    privileged: [privileged.shopDb],
    async handler(ctx) {
      return callShop(ctx, "listCatalog", {});
    },
  }),

  adminCreateCatalogEntry: defineAction({
    request: z.object({
      catalog: catalogKindSchema,
      name: z.string().min(1).max(120),
      code: z.string().max(20).default(""),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      entryId: z.number().nullable(),
    }),
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{
        ok: boolean;
        error: string | null;
        entryId: number | null;
      }>(ctx, "createCatalogEntry", args);
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminUpdateCatalogEntry: defineAction({
    request: z.object({
      catalog: catalogKindSchema,
      id: z.number().int().positive(),
      name: z.string().min(1).max(120),
      code: z.string().max(20).default(""),
    }),
    response: okErrorOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null }>(
        ctx,
        "updateCatalogEntry",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminDeleteCatalogEntry: defineAction({
    request: z.object({
      catalog: catalogKindSchema,
      id: z.number().int().positive(),
    }),
    response: okErrorOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null }>(
        ctx,
        "deleteCatalogEntry",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),
};

