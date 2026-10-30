ALTER TABLE `products` ADD COLUMN `model_maker` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `sku` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `sku_status` text DEFAULT 'incomplete' NOT NULL;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `internal_code` text;
--> statement-breakpoint
ALTER TABLE `product_variants` ADD COLUMN `sku` text;
--> statement-breakpoint
ALTER TABLE `product_variants` ADD COLUMN `sku_status` text DEFAULT 'incomplete' NOT NULL;
--> statement-breakpoint
ALTER TABLE `product_variants` ADD COLUMN `internal_code` text;
--> statement-breakpoint
ALTER TABLE `order_items` ADD COLUMN `product_sku` text;
--> statement-breakpoint
ALTER TABLE `order_items` ADD COLUMN `variant_sku` text;
--> statement-breakpoint
UPDATE `products` SET `internal_code` = 'INT-P' || `id` WHERE `internal_code` IS NULL;
--> statement-breakpoint
UPDATE `product_variants` SET `internal_code` = 'INT-V' || `id` WHERE `internal_code` IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_internal_code_unique` ON `products` (`internal_code`);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_sku_unique` ON `product_variants` (`sku`);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_internal_code_unique` ON `product_variants` (`internal_code`);
