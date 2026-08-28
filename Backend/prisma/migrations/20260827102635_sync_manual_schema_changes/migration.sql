/*
  Warnings:

  - You are about to drop the column `image_url` on the `post_images` table. All the data in the column will be lost.
  - Added the required column `display_url` to the `post_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail_url` to the `post_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `finances` ADD COLUMN `semester` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `invitation_codes` ADD COLUMN `phone` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `post_images` DROP COLUMN `image_url`,
    ADD COLUMN `display_url` VARCHAR(500) NOT NULL,
    ADD COLUMN `original_name` VARCHAR(255) NULL,
    ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `thumbnail_url` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `deleted_at` TIMESTAMP(0) NULL,
    ADD COLUMN `graduated_at` TIMESTAMP(0) NULL,
    ADD COLUMN `is_active` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `position` VARCHAR(255) NULL,
    ADD COLUMN `withdraw_reason` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `post_files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `original_name` VARCHAR(255) NULL,
    `file_name` VARCHAR(255) NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `download_url` VARCHAR(500) NULL,
    `size` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `post_files_post_id_idx`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `post_files` ADD CONSTRAINT `post_files_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
