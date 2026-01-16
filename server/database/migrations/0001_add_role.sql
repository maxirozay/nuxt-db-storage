PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`path` text NOT NULL,
	`size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`uploaded_at` integer DEFAULT '"2026-01-16T16:38:22.649Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_files`("id", "filename", "path", "size", "mime_type", "uploaded_at") SELECT "id", "filename", "path", "size", "mime_type", "uploaded_at" FROM `files`;--> statement-breakpoint
DROP TABLE `files`;--> statement-breakpoint
ALTER TABLE `__new_files` RENAME TO `files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT '"2026-01-16T16:38:22.648Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "created_at") SELECT "id", "name", "email", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);