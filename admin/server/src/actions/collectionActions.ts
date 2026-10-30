import { defineAction, z } from "../space";
import { privileged } from "../privileged";
import { okErrorOut } from "../schemas/productSchemas";
import {
  collectionConditionIn,
  collectionOut,
  collectionWriteOut,
  thumbnailConfigIn,
} from "../schemas/catalogSchemas";
import { callShop } from "../schemas/analyticsSchemas";

export const collectionActions = {
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
    }),
    response: collectionWriteOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{
        ok: boolean;
        error: string | null;
        collectionId: number | null;
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
    }),
    response: okErrorOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null }>(
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

