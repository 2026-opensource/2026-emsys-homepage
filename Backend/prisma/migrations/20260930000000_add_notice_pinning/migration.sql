-- AlterTable
ALTER TABLE `posts` ADD COLUMN `is_pinned` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `posts_notice_pin_order_idx`
ON `posts`(`board_type`, `category`, `is_draft`, `is_pinned`);
