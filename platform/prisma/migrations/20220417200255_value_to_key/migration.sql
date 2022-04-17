/*
  Warnings:

  - You are about to drop the column `value` on the `Responses` table. All the data in the column will be lost.
  - Added the required column `key` to the `Responses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Responses` DROP COLUMN `value`,
    ADD COLUMN `key` VARCHAR(191) NOT NULL;
