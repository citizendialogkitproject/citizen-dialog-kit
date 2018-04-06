CREATE SCHEMA IF NOT EXISTS `kul_display` DEFAULT CHARACTER SET utf8mb4;
USE `kul_display`;

DROP TABLE IF EXISTS `kul_display`.`image`;
CREATE TABLE IF NOT EXISTS `kul_display`.`image` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`handle` VARCHAR(128) NOT NULL UNIQUE,
	`name` VARCHAR(128) NOT NULL,
	`description` VARCHAR(256),
	`notes` VARCHAR(512),
	`created_at` DATETIME(6),
	`md5` VARCHAR(32),
	`bytes_original` INT,
	`bytes_processed` INT,
	`screen_type` VARCHAR(64),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;
CREATE UNIQUE INDEX `image_handle` ON `kul_display`.`image` (`handle` ASC);

DROP TABLE IF EXISTS `kul_display`.`display`;
CREATE TABLE IF NOT EXISTS `kul_display`.`display` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`handle` VARCHAR(128) NOT NULL UNIQUE,
	`serial` VARCHAR(128) NOT NULL UNIQUE,
	`description` VARCHAR(256),
	`created_at` DATETIME(6),
	`last_seen_at` DATETIME(6),
	`screen_type` VARCHAR(64),
	`tags` VARCHAR(512),
	`image_id` INT,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON DELETE SET NULL
) ENGINE = InnoDB;
CREATE UNIQUE INDEX `display_handle` ON `kul_display`.`display` (`handle` ASC);

DROP TABLE IF EXISTS `kul_display`.`schedule`;
CREATE TABLE IF NOT EXISTS `kul_display`.`schedule` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`handle` VARCHAR(128) NOT NULL UNIQUE,
	`created_at` DATETIME(6),
	`start` INT,
	`stop` INT,
	`image_id` INT,
	`display_id` INT,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON DELETE CASCADE,
	FOREIGN KEY (`display_id`) REFERENCES `display`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB;
CREATE UNIQUE INDEX `schedule_handle` ON `kul_display`.`schedule` (`handle` ASC);

DROP TABLE IF EXISTS `kul_display`.`result`;
CREATE TABLE IF NOT EXISTS `kul_display`.`result` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`handle` VARCHAR(128) NOT NULL UNIQUE,
	`created_at` DATETIME(6),
	`value` VARCHAR(256),
	`image_id` INT,
	`display_id` INT,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON DELETE SET NULL,
	FOREIGN KEY (`display_id`) REFERENCES `display`(`id`) ON DELETE SET NULL
) ENGINE = InnoDB;
CREATE UNIQUE INDEX `result_handle` ON `kul_display`.`result` (`handle` ASC);
CREATE UNIQUE INDEX `result_created_at` ON `kul_display`.`result` (`created_at` ASC);
