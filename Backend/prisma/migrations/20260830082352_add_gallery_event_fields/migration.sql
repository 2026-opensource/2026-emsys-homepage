-- AlterTable
ALTER TABLE `posts` ADD COLUMN `event_end_date` DATE NULL,
    ADD COLUMN `event_start_date` DATE NULL,
    ADD COLUMN `location` VARCHAR(255) NULL;
