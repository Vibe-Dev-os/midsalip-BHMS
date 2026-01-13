CREATE TABLE `boarding_houses` (
	`id` varchar(255) NOT NULL,
	`owner_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`barangay` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`contact_number` varchar(20) NOT NULL,
	`permit_number` varchar(255) NOT NULL,
	`permit_issue_date` varchar(10) NOT NULL,
	`permit_expiry_date` varchar(10) NOT NULL,
	`permit_document` varchar(500),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`is_active` boolean DEFAULT true,
	`permit_status` enum('valid','expired','near-expiry','pending') NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boarding_houses_id` PRIMARY KEY(`id`),
	CONSTRAINT `boarding_houses_permit_number_unique` UNIQUE(`permit_number`)
);
--> statement-breakpoint
CREATE TABLE `occupants` (
	`id` varchar(255) NOT NULL,
	`room_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`contact_number` varchar(20) NOT NULL,
	`move_in_date` varchar(10) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `occupants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` varchar(255) NOT NULL,
	`boarding_house_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`capacity` int NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('admin','owner') NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
