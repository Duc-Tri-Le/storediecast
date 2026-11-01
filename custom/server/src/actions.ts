import type { ActionsModule } from "./space";
import { listProducts } from "./products";
import { listCollections } from "./collections";
import { createOrder, listOrders, updateOrderStatus } from "./orders";
import { validateDiscountCode } from "./discounts";
import { listCatalog } from "./catalogActions";

export const Actions = {
  listProducts,
  listCollections,
  createOrder,
  listOrders,
  updateOrderStatus,
  validateDiscountCode,
  listCatalog,
} satisfies ActionsModule;
