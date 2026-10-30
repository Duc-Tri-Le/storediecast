ALTER TABLE `orders` ADD COLUMN `discount_code` text;
--> statement-breakpoint
ALTER TABLE `orders` ADD COLUMN `discount_amount` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD COLUMN `subtotal_after_coupon` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE `orders` SET `subtotal_after_coupon` = `subtotal` WHERE `subtotal_after_coupon` = 0;
