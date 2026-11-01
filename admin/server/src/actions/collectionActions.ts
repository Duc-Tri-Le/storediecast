import { defineAction, z } from "../space";
import { privileged } from "../privileged";
import { okErrorOut } from "../schemas/productSchemas";
import {
  collectionConditionIn,
  collectionOut,
  adminCollectionsPaginatedOut,
  thumbnailConfigIn,
} from "../schemas/catalogSchemas";
import { callShop } from "../schemas/analyticsSchemas";

export const collectionActions = {
  adminListCollectionsPaginated: defineAction({
    request: z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(200).default(50),
      tab: z.enum(["all", "manual", "auto"]).default("all"),
      search: z.string().default(""),
      sort: z.enum(["default", "titleAsc", "titleDesc", "newest"]).default("default"),
    }),
    response: adminCollectionsPaginatedOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      return callShop(ctx, "listCollectionsPaginated", args);
    },
  }),
  adminListCollections: defineAction({
    request: z.object({}),
    response: z.object({ collections: z.array(collectionOut) }),
    privileged: [privileged.shopDb],
    async handler(ctx) {
      return callShop(ctx, "listCollections", {});
    },
  }),

  adminCreateCollection: defineAction({
    request: z.object({
      title: z.string().min(2).max(120),
      status: z.enum(["draft", "published"]).default("draft"),
      kind: z.enum(["manual", "auto"]).default("manual"),
      conditions: z.array(collectionConditionIn).max(20).default([]),
      productIds: z.array(z.number().int().positive()).max(500).default([]),
      description: z.string().max(4000).optional(),
      matchMode: z.enum(["all", "any"]).optional(),
      visible: z.boolean().optional(),
      imageKey: z.string().max(1500000).optional(),
      thumbnailConfig: thumbnailConfigIn.optional(),
      seoTitle: z.string().max(200).optional(),
      seoDescription: z.string().max(1000).optional(),
      slug: z.string().max(200).optional(),
      force: z.boolean().optional(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      collectionId: z.number().nullable(),
      duplicateWarning: z.boolean().optional(),
      duplicateTitle: z.string().optional(),
      scale: z.string().optional(),
      kindLabel: z.string().optional(),
    }),
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{
        ok: boolean;
        error: string | null;
        collectionId: number | null;
        duplicateWarning?: boolean;
        duplicateTitle?: string;
        scale?: string;
        kindLabel?: string;
      }>(ctx, "createCollection", args);
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminUpdateCollection: defineAction({
    request: z.object({
      id: z.number().int().positive(),
      title: z.string().min(2).max(120),
      status: z.enum(["draft", "published"]),
      conditions: z.array(collectionConditionIn).max(20).optional(),
      kind: z.enum(["manual", "auto"]).optional(),
      description: z.string().max(4000).optional(),
      matchMode: z.enum(["all", "any"]).optional(),
      visible: z.boolean().optional(),
      imageKey: z.string().max(1500000).optional(),
      thumbnailConfig: thumbnailConfigIn.optional(),
      seoTitle: z.string().max(200).optional(),
      seoDescription: z.string().max(1000).optional(),
      slug: z.string().max(200).optional(),
      force: z.boolean().optional(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      duplicateWarning: z.boolean().optional(),
      duplicateTitle: z.string().optional(),
      scale: z.string().optional(),
    }),
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{
        ok: boolean;
        error: string | null;
        duplicateWarning?: boolean;
        duplicateTitle?: string;
        scale?: string;
      }>(
        ctx,
        "updateCollection",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminSetCollectionProducts: defineAction({
    request: z.object({
      collectionId: z.number().int().positive(),
      productIds: z.array(z.number().int().positive()).max(500),
    }),
    response: okErrorOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null }>(
        ctx,
        "setCollectionProducts",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminDeleteCollection: defineAction({
    request: z.object({ collectionId: z.number().int().positive() }),
    response: okErrorOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null }>(
        ctx,
        "deleteCollection",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminDeleteCollectionsBulk: defineAction({
    request: z.object({
      collectionIds: z.array(z.number().int().positive()).min(1).max(500),
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
      }>(ctx, "deleteCollectionsBulk", args);
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),
};

