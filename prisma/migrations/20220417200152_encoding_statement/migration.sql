/*
  Warnings:

  - You are about to drop the column `statement` on the `Responses` table. All the data in the column will be lost.
  - Added the required column `statementId` to the `Responses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Responses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Responses` DROP COLUMN `statement`,
    ADD COLUMN `statementId` INTEGER NOT NULL,
    ADD COLUMN `value` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Responses` ADD CONSTRAINT `Responses_statementId_fkey` FOREIGN KEY (`statementId`) REFERENCES `Statement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
