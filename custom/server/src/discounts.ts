import { defineAction, z } from "./space";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { discountAmountFor } from "./pricing";

// ── Mã giảm giá — dùng CHUNG database với web quản trị ──────────────
export async function ensureDefaultDiscounts(db: any): Promise<void> {
  const rows = await db.select().from(schema.discounts);
  if (rows.length > 0) return;
  const now = new Date().toISOString();
  await db
    .insert(schema.discounts)
    .values({ code: "GIAM10", kind: "percent", value: 10, active: 1, createdAt: now })
    .onConflictDoNothing();
  await db
    .insert(schema.discounts)
    .values({ code: "GIAM50K", kind: "fixed", value: 50000, active: 1, createdAt: now })
    .onConflictDoNothing();
}

export async function findActiveDiscount(db: any, rawCode: string) {
  await ensureDefaultDiscounts(db);
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  const rows = await db.select().from(schema.discounts).where(eq(schema.discounts.code, code)).limit(1);
  const row = rows[0];
  if (!row || row.active !== 1) return null;
  return row;
}

const appliedCouponOut = z.object({
  code: z.string(),
  kind: z.string(),
  value: z.number(),
});

export const validateDiscountCode = defineAction({
  request: z.object({
    code: z.string().min(1).max(40),
    subtotalAfterBulk: z.number().int().min(0),
  }),
  response: z.object({
    valid: z.boolean(),
    error: z.string().nullable(),
    coupon: appliedCouponOut.nullable(),
    discountAmount: z.number(),
  }),
  async handler(ctx, args): Promise<{ valid: boolean; error: string | null; coupon: z.infer<typeof appliedCouponOut> | null; discountAmount: number }> {
    const db = ctx.db;
    const found = await findActiveDiscount(db, args.code);
    if (!found) {
      return { valid: false, error: "Mã giảm giá không hợp lệ. Kiểm tra lại mã rồi thử lại, hoặc xóa mã này và đặt hàng bình thường — mã không bắt buộc.", coupon: null, discountAmount: 0 };
    }
    return {
      valid: true,
      error: null,
      coupon: { code: found.code, kind: found.kind, value: found.value },
      discountAmount: discountAmountFor(found.kind, found.value, args.subtotalAfterBulk),
    };
  },
});
