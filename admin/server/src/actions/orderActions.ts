import { defineAction, z } from "../space";
import { privileged } from "../privileged";
import { adminOrderOut, adminOrdersPaginatedOut, okErrorOut } from "../schemas/productSchemas";
import { callShop } from "../schemas/analyticsSchemas";

export const orderActions = {
  adminListOrdersPaginated: defineAction({
    request: z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(200).default(50),
      tab: z.enum(["all", "open", "hold", "closed"]).default("all"),
      search: z.string().default(""),
    }),
    response: adminOrdersPaginatedOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      return callShop(ctx, "listOrdersPaginated", args);
    },
  }),
  adminListOrders: defineAction({
    request: z.object({}),
    response: z.object({ orders: z.array(adminOrderOut) }),
    privileged: [privileged.shopDb],
    async handler(ctx) {
      return callShop(ctx, "listOrders", {});
    },
  }),

  adminUpdateOrderStatus: defineAction({
    request: z.object({
      orderId: z.number().int().positive(),
      status: z.enum(["new", "confirmed", "done", "cancelled"]),
    }),
    response: okErrorOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null }>(
        ctx,
        "updateOrderStatus",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),

  adminUpdateOrderInfo: defineAction({
    request: z.object({
      orderId: z.number().int().positive(),
      customerName: z.string().min(2).max(120),
      customerPhone: z.string().min(8).max(30),
      customerAddress: z.string().min(1).max(500),
      note: z.string().max(1000).default(""),
    }),
    response: okErrorOut,
    privileged: [privileged.shopDb],
    async handler(ctx, args) {
      const res = await callShop<{ ok: boolean; error: string | null }>(
        ctx,
        "updateOrderInfo",
        args,
      );
      if (res.ok) ctx?.invalidateQueries?.();
      return res;
    },
  }),
};

