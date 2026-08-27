-- AlterTable
ALTER TABLE `comments` ADD COLUMN `parent_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `is_draft` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `comments_parent_id_idx` ON `comments`(`parent_id`);

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
