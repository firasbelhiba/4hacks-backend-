/*
  Warnings:

  - You are about to drop the column `disabledAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `disabledReason` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isDisabled` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "disabledAt",
DROP COLUMN "disabledReason",
DROP COLUMN "isDisabled",
ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedReason" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
