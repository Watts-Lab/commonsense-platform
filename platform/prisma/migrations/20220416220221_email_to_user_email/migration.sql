/*
  Warnings:

  - You are about to drop the column `email` on the `Responses` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `Responses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Responses` DROP FOREIGN KEY `Responses_email_fkey`;

-- AlterTable
ALTER TABLE `Responses` DROP COLUMN `email`,
    ADD COLUMN `userEmail` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Responses` ADD CONSTRAINT `Responses_userEmail_fkey` FOREIGN KEY (`userEmail`) REFERENCES `User`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;
