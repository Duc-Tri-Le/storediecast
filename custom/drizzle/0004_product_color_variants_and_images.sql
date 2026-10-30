CREATE TABLE product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  color_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  promo_price INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  image_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  variant_id INTEGER,
  image_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE order_items ADD COLUMN variant_id INTEGER;
--> statement-breakpoint
ALTER TABLE order_items ADD COLUMN color_name TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
INSERT INTO product_variants (product_id, color_name, price, promo_price, stock, image_key, sort_order)
SELECT id, color_name, price, promo_price, stock, image_key, 0 FROM products;
--> statement-breakpoint
INSERT INTO product_images (product_id, variant_id, image_key, sort_order)
SELECT v.product_id, v.id, v.image_key, 0 FROM product_variants v WHERE v.sort_order = 0;
