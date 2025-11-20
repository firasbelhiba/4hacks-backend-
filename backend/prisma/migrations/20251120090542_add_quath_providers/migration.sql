/*
  Warnings:

  - You are about to drop the column `expiredAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the `activity_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bookmarks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hackathons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('CREDENTIAL', 'GOOGLE', 'GITHUB', 'LINKEDIN');

-- DropForeignKey
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_userId_fkey";

-- DropForeignKey
ALTER TABLE "hackathons" DROP CONSTRAINT "hackathons_userId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_orgId_fkey";

-- DropForeignKey
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_userId_fkey";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "expiredAt",
ADD COLUMN     "provider" "Provider" NOT NULL DEFAULT 'CREDENTIAL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "providers" "Provider"[] DEFAULT ARRAY[]::"Provider"[];

-- DropTable
DROP TABLE "activity_logs";

-- DropTable
DROP TABLE "bookmarks";

-- DropTable
DROP TABLE "hackathons";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "organization_members";

-- DropTable
DROP TABLE "organizations";
