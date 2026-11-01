import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ── Bảng sản phẩm dùng chung với Quản trị (bảng 'products') ─────────
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  loaiXe: text("loai_xe").notNull().default(""),
  hangXe: text("hang_xe").notNull().default(""),
  hangMoHinh: text("hang_mo_hinh").notNull().default(""),
  tiLe: text("ti_le").notNull().default(""),
  tags: text("tags").notNull().default(""),
  featured: integer("featured").notNull().default(0),
  slug: text("slug").notNull().default(""),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  costPrice: integer("cost_price"),
  shippingWeight: real("shipping_weight"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── Biến thể màu sản phẩm dùng chung với Quản trị (bảng 'variants') ──
// position = 0 là màu mặc định trên kệ
export const variants = sqliteTable("variants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  color: text("color").notNull(),
  stock: integer("stock").notNull().default(0),
  price: integer("price").notNull(),
  promoPrice: integer("promo_price"),
  image: text("image").notNull().default(""),
  sku: text("sku"),
  barcode: text("barcode"),
  variantTag: text("variant_tag"),
  position: integer("position").notNull().default(0),
});

// ── Đơn hàng dùng chung với Quản trị (bảng 'orders') ─────────────────
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull().default(""),
  note: text("note").notNull().default(""),
  paymentMethod: text("payment_method").notNull().default("transfer"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  status: text("status").notNull().default("new"),
  subtotalBeforeBulk: integer("subtotal_before_bulk").notNull().default(0),
  bulkPct: integer("bulk_pct").notNull().default(0),
  bulkDiscount: integer("bulk_discount").notNull().default(0),
  discountCode: text("discount_code").default(""),
  discountAmount: integer("discount_amount").notNull().default(0),
  shippingFee: integer("shipping_fee").notNull().default(30000),
  total: integer("total").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  confirmedAt: text("confirmed_at"),
  doneAt: text("done_at"),
  cancelledAt: text("cancelled_at"),
});

// ── Chi tiết dòng đơn dùng chung với Quản trị (bảng 'order_lines') ───
export const orderLines = sqliteTable("order_lines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  variantId: integer("variant_id"),
  productName: text("product_name").notNull(),
  color: text("color").notNull().default(""),
  scale: text("scale").notNull().default(""),
  sku: text("sku"),
  unitPrice: integer("unit_price").notNull().default(0),
  qty: integer("qty").notNull().default(0),
  lineTotal: integer("line_total").notNull().default(0),
});

// ── Mã giảm giá dùng chung với Quản trị (bảng 'discounts') ───────────
export const discounts = sqliteTable("discounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  kind: text("kind").notNull().default("percent"),
  value: integer("value").notNull().default(0),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull(),
});

// ── Danh mục dùng chung với Quản trị (bảng 'catalog_entries') ────────
export const catalogEntries = sqliteTable("catalog_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  createdAt: text("created_at").notNull(),
});

export const catalogVehicleTypes = sqliteTable("catalog_vehicle_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const catalogScales = sqliteTable("catalog_scales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().default(""),
});

export const catalogCarBrands = sqliteTable("catalog_car_brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().default(""),
});

// ── Bộ sưu tập dùng chung với Quản trị (bảng 'collections') ─────────
export const collections = sqliteTable("collections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("published"),
  kind: text("kind").notNull().default("auto"),
  matchMode: text("match_mode").notNull().default("all"),
  visibleOnList: integer("visible_on_list").notNull().default(1),
  imageKey: text("image_key").notNull().default(""),
  isScale: integer("is_scale").notNull().default(0),
  slug: text("slug").notNull().default(""),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});
