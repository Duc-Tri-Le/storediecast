import { z, type Ctx } from "../space";
import { runOp } from "../privileged";

export type ShopOp =
  | "overview"
  | "listProducts"
  | "upsertProduct"
  | "deleteProduct"
  | "deleteProductsBulk"
  | "deleteVariantsBulk"
  | "deleteCollectionsBulk"
  | "listOrders"
  | "updateOrderStatus"
  | "updateOrderInfo"
  | "listDiscounts"
  | "upsertDiscount"
  | "deleteDiscount"
  | "importProducts"
  | "listCollections"
  | "createCollection"
  | "updateCollection"
  | "setCollectionProducts"
  | "deleteCollection"
  | "listCatalog"
  | "createCatalogEntry"
  | "updateCatalogEntry"
  | "deleteCatalogEntry"
  | "listBulkUpdates"
  | "applyBulkUpdate"
  | "analytics";

export async function callShop<T>(_ctx: Ctx, op: ShopOp, params: unknown): Promise<T> {
  const result = runOp(op, (params ?? {}) as any);
  return result as T;
}

export const overviewOut = z.object({
  totalProducts: z.number(),
  totalVariants: z.number(),
  totalStock: z.number(),
  lowStockVariants: z.number(),
  outOfStockVariants: z.number(),
  totalOrders: z.number(),
  newOrders: z.number(),
  confirmedOrders: z.number(),
  doneOrders: z.number(),
  cancelledOrders: z.number(),
  revenueDone: z.number(),
  revenueAllNonCancelled: z.number(),
  activeDiscounts: z.number(),
  totalDiscounts: z.number(),
  incompleteSkuProducts: z.number(),
});

export const analyticsProductOut = z.object({
  productId: z.number(),
  productName: z.string(),
  scale: z.string(),
  brand: z.string(),
  vehicleType: z.string(),
  qty: z.number(),
  revenue: z.number(),
  productExists: z.boolean(),
  bestVariant: z
    .object({ colorName: z.string(), qty: z.number(), revenue: z.number() })
    .nullable(),
});

export const analyticsGroupOut = z.object({
  name: z.string(),
  qty: z.number(),
  revenue: z.number(),
  orders: z.number(),
  share: z.number(),
});

export const analyticsOut = z.object({
  range: z.string(),
  granularity: z.string(),
  startAt: z.string().nullable(),
  endAt: z.string(),
  kpis: z.object({
    revenue: z.number(),
    orderCount: z.number(),
    paidOrderCount: z.number(),
    averageOrderValue: z.number(),
    itemsSold: z.number(),
  }),
  series: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      revenue: z.number(),
      orders: z.number(),
    }),
  ),
  topByQty: z.array(analyticsProductOut),
  topByRevenue: z.array(analyticsProductOut),
  byScale: z.array(analyticsGroupOut),
  byVehicleType: z.array(analyticsGroupOut),
  byBrand: z.array(analyticsGroupOut),
  byStatus: z.array(
    z.object({ status: z.string(), count: z.number(), revenue: z.number() }),
  ),
  unpaidOrders: z.object({
    count: z.number(),
    totalValue: z.number(),
    orders: z.array(
      z.object({
        id: z.number(),
        createdAt: z.string(),
        customerName: z.string(),
        customerPhone: z.string(),
        itemCount: z.number(),
        total: z.number(),
        status: z.string(),
      }),
    ),
  }),
  discounts: z.object({
    subtotalBeforeBulk: z.number(),
    bulkDiscount: z.number(),
    couponDiscount: z.number(),
    subtotalAfterCoupon: z.number(),
    shippingFee: z.number(),
    totalRevenue: z.number(),
  }),
  inventory: z.object({
    lowStockCount: z.number(),
    outOfStockCount: z.number(),
    items: z.array(
      z.object({
        productId: z.number(),
        productName: z.string(),
        variantId: z.number(),
        colorName: z.string(),
        scale: z.string(),
        stock: z.number(),
      }),
    ),
  }),
  customers: z.object({
    totalCustomers: z.number(),
    repeatCustomerCount: z.number(),
    singlePurchaseCount: z.number(),
    hasEnoughData: z.boolean(),
    repeatCustomers: z.array(
      z.object({
        phone: z.string(),
        name: z.string(),
        orders: z.number(),
        spent: z.number(),
      }),
    ),
  }),
});

