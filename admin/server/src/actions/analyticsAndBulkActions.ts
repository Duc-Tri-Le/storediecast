import { defineAction, z } from "../space";
import { privileged } from "../privileged";
import { discountOut, okErrorOut } from "../schemas/productSchemas";
import {
  bulkActionIn,
  bulkApplyOut,
  bulkUpdatesOut,
  collectionConditionIn,
} from "../schemas/catalogSchemas";
import {
  analyticsOut,
  callShop,
  overviewOut,
} from "../schemas/analyticsSchemas";

export const analyticsAndBulkActions = {
  adminOverview: defineAction({
    request: z.object({}),
    response: overviewOut,
    privileged: [privileged.shopDb],
    async handler(ctx): Promise<z.infer<typeof overviewOut>> {
      return callShop<z.infer<typeof overviewOut>>(ctx, "overview", {});
    },
  }),

  adminAnalytics: defineAction({
    request: z.object({
      range: z.enum(["today", "7d", "30d", "90d", "all"]),
    }),
    response: analyticsOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args): Promise<z.infer<typeof analyticsOut>> {
      return callShop<z.infer<typeof analyticsOut>>(ctx, "analytics", args);
    },
  }),

  adminListDiscounts: defineAction({
    request: z.object({}),
    response: z.object({ discounts: z.array(discountOut) }),
    privileged: [privileged.shopDb],
    async handler(ctx) {
      return callShop(ctx, "listDiscounts", {});
    },
  }),

  adminUpsertDiscount: defineAction({
    request: z.object({
      id: z.number().int().positive().nullable().default(null),
      code: z.string().min(2).max(40),
      kind: z.enum(["percent", "fixed"]),
      value: z.number().int().positive(),
      isActive: z.boolean().default(true),
      note: z.string().max(200).default(""),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      discountId: z.number().nullable(),
    }),
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null; discountId: number | null }>(
        ctx,
        "upsertDiscount",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminDeleteDiscount: defineAction({
    request: z.object({ discountId: z.number().int().positive() }),
    response: okErrorOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null }>(
        ctx,
        "deleteDiscount",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminListBulkUpdates: defineAction({
    request: z.object({}),
    response: bulkUpdatesOut,
    privileged: [privileged.shopDb],
    async handler(ctx) {
      return callShop(ctx, "listBulkUpdates", {});
    },
  }),

  adminApplyBulkUpdate: defineAction({
    request: z.object({
      conditions: z.array(collectionConditionIn).min(1).max(10),
      matchMode: z.enum(["all", "any"]),
      variantMustMatch: z.boolean().default(false),
      actions: z.array(bulkActionIn).min(1).max(8),
    }),
    response: bulkApplyOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args): Promise<z.infer<typeof bulkApplyOut>> {
      const res = await callShop<z.infer<typeof bulkApplyOut>>(
        ctx,
        "applyBulkUpdate",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),
};

