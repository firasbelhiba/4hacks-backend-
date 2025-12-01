/*
  Warnings:

  - You are about to drop the column `hackathonId` on the `hackathon_registration_answers` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `hackathon_registration_answers` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `teams` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registrationId]` on the table `hackathon_registration_answers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teamId]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hackathonId,name]` on the table `teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `registrationId` to the `hackathon_registration_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `team_members` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HackathonRegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "hackathon_registration_answers" DROP CONSTRAINT "hackathon_registration_answers_hackathonId_fkey";

-- DropForeignKey
ALTER TABLE "hackathon_registration_answers" DROP CONSTRAINT "hackathon_registration_answers_userId_fkey";

-- DropIndex
DROP INDEX "hackathon_registration_answers_hackathonId_idx";

-- DropIndex
DROP INDEX "hackathon_registration_answers_hackathonId_userId_key";

-- DropIndex
DROP INDEX "hackathon_registration_answers_userId_idx";

-- AlterTable
ALTER TABLE "hackathon_registration_answers" DROP COLUMN "hackathonId",
DROP COLUMN "userId",
ADD COLUMN     "registrationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "bountyId" TEXT,
ADD COLUMN     "isWinner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "team_members" DROP COLUMN "role",
ADD COLUMN     "isLeader" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "avatar",
ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "hackathon_registrations" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "HackathonRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hackathon_registrations_hackathonId_status_idx" ON "hackathon_registrations"("hackathonId", "status");

-- CreateIndex
CREATE INDEX "hackathon_registrations_hackathonId_idx" ON "hackathon_registrations"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_registrations_userId_idx" ON "hackathon_registrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_registrations_hackathonId_userId_key" ON "hackathon_registrations"("hackathonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_registration_answers_registrationId_key" ON "hackathon_registration_answers"("registrationId");

-- CreateIndex
CREATE INDEX "hackathon_registration_answers_registrationId_idx" ON "hackathon_registration_answers"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_teamId_key" ON "projects"("teamId");

-- CreateIndex
CREATE INDEX "teams_hackathonId_id_idx" ON "teams"("hackathonId", "id");

-- CreateIndex
CREATE INDEX "teams_name_idx" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_hackathonId_name_key" ON "teams"("hackathonId", "name");

-- AddForeignKey
ALTER TABLE "hackathon_registration_answers" ADD CONSTRAINT "hackathon_registration_answers_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "hackathon_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "bounties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
