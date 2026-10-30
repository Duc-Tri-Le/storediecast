ALTER TABLE `orders` ADD COLUMN `subtotal_before_bulk` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD COLUMN `bulk_pct` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD COLUMN `bulk_discount_amount` integer DEFAULT 0 NOT NULL;
