import { z } from "./space";
import { and, eq, gte, sql } from "drizzle-orm";
import * as schema from "./schema";
import type { ProductRow, VariantRow } from "./catalog";

export const orderItemOut = z.object({
  id: z.number(),
  productId: z.number(),
  variantId: z.number().nullable(),
  colorName: z.string(),
  productName: z.string(),
  scale: z.string(),
  unitPrice: z.number(),
  quantity: z.number(),
});

export const orderOut = z.object({
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
  items: z.array(orderItemOut),
});

export interface StockLine {
  product: ProductRow;
  variant: VariantRow;
  quantity: number;
  unitPrice: number;
}

// Trừ kho nguyên tử cho một dòng biến thể; trả về false nếu không đủ tồn.
export async function tryDecrement(db: any, line: StockLine): Promise<boolean> {
  const upd = await db
    .update(schema.variants)
    .set({ stock: sql`${schema.variants.stock} - ${line.quantity}` })
    .where(
      and(
        eq(schema.variants.id, line.variant.id),
        gte(schema.variants.stock, line.quantity),
      ),
    )
    .returning({ id: schema.variants.id });
  return upd.length > 0;
}

// Cộng trả kho (hoàn tác khi tạo đơn thất bại giữa chừng hoặc khi hủy đơn).
export async function incrementStock(db: any, line: StockLine): Promise<void> {
  await db
    .update(schema.variants)
    .set({ stock: sql`${schema.variants.stock} + ${line.quantity}` })
    .where(eq(schema.variants.id, line.variant.id));
}

export const createOrderResponse = z.object({
  ok: z.boolean(),
  orderId: z.number().nullable(),
  error: z.string().nullable(),
  total: z.number(),
});
export type CreateOrderResult = z.infer<typeof createOrderResponse>;

export const updateOrderStatusResponse = z.object({
  ok: z.boolean(),
  error: z.string().nullable(),
});
export type UpdateOrderStatusResult = z.infer<typeof updateOrderStatusResponse>;

