CREATE TABLE `discount_codes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `code` text NOT NULL,
  `kind` text DEFAULT 'percent' NOT NULL,
  `value` integer NOT NULL,
  `is_active` integer DEFAULT 1 NOT NULL,
  `note` text DEFAULT '' NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `discount_codes_code_unique` ON `discount_codes` (`code`);
