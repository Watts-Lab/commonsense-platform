/*
  Warnings:

  - You are about to drop the column `userId` on the `Responses` table. All the data in the column will be lost.
  - Added the required column `email` to the `Responses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Responses` DROP FOREIGN KEY `Responses_userId_fkey`;

-- AlterTable
ALTER TABLE `Responses` DROP COLUMN `userId`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Responses` ADD CONSTRAINT `Responses_email_fkey` FOREIGN KEY (`email`) REFERENCES `User`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;
