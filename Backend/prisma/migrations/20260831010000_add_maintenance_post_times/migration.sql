ALTER TABLE `posts`
  ADD COLUMN `maintenance_start_at` TIMESTAMP(0) NULL,
  ADD COLUMN `maintenance_end_at` TIMESTAMP(0) NULL;
