/*
  Warnings:

  - You are about to drop the column `email` on the `failed_logins` table. All the data in the column will be lost.
  - Added the required column `identifier` to the `failed_logins` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "failed_logins_email_idx";

-- AlterTable
ALTER TABLE "failed_logins" DROP COLUMN "email",
ADD COLUMN     "identifier" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "failed_logins_identifier_idx" ON "failed_logins"("identifier");
