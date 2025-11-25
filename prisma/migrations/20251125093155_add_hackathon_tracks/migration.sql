/*
  Warnings:

  - You are about to drop the column `isPublic` on the `hackathons` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `tracks` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `tracks` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `tracks` table. All the data in the column will be lost.
  - Added the required column `category` to the `hackathons` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `hackathons` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `tracks` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "HackathonCategory" AS ENUM ('WEB3', 'AI');

-- DropIndex
DROP INDEX "hackathons_status_isPublic_idx";

-- DropIndex
DROP INDEX "tracks_hackathonId_slug_key";

-- AlterTable
ALTER TABLE "hackathons" DROP COLUMN "isPublic",
ADD COLUMN     "category" "HackathonCategory" NOT NULL,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prizeToken" TEXT NOT NULL DEFAULT 'USD',
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "tracks" DROP COLUMN "color",
DROP COLUMN "icon",
DROP COLUMN "slug",
ADD COLUMN     "judgingCriteria" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "hackathons_status_isPrivate_idx" ON "hackathons"("status", "isPrivate");
