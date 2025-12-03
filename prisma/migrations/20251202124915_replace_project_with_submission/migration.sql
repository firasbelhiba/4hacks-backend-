/*
  Warnings:

  - You are about to drop the column `projectId` on the `prize_winners` table. All the data in the column will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[prizeId,submissionId]` on the table `prize_winners` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `submissionId` to the `prize_winners` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- DropForeignKey
ALTER TABLE "prize_winners" DROP CONSTRAINT "prize_winners_projectId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_bountyId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_hackathonId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_teamId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_trackId_fkey";

-- DropIndex
DROP INDEX "prize_winners_prizeId_projectId_key";

-- DropIndex
DROP INDEX "prize_winners_projectId_idx";

-- AlterTable
ALTER TABLE "prize_winners" DROP COLUMN "projectId",
ADD COLUMN     "submissionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "projects";

-- DropEnum
DROP TYPE "ProjectStatus";

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "trackId" TEXT,
    "bountyId" TEXT,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "submissionReviewedAt" TIMESTAMP(3),
    "submissionReviewedById" TEXT,
    "demoUrl" TEXT,
    "videoUrl" TEXT,
    "repoUrl" TEXT,
    "pitchUrl" TEXT,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submissions_hackathonId_status_idx" ON "submissions"("hackathonId", "status");

-- CreateIndex
CREATE INDEX "submissions_teamId_idx" ON "submissions"("teamId");

-- CreateIndex
CREATE INDEX "submissions_trackId_idx" ON "submissions"("trackId");

-- CreateIndex
CREATE INDEX "submissions_creatorId_idx" ON "submissions"("creatorId");

-- CreateIndex
CREATE INDEX "submissions_submittedAt_idx" ON "submissions"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_teamId_hackathonId_key" ON "submissions"("teamId", "hackathonId");

-- CreateIndex
CREATE INDEX "prize_winners_submissionId_idx" ON "prize_winners"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "prize_winners_prizeId_submissionId_key" ON "prize_winners"("prizeId", "submissionId");

-- AddForeignKey
ALTER TABLE "prize_winners" ADD CONSTRAINT "prize_winners_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submissionReviewedById_fkey" FOREIGN KEY ("submissionReviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "bounties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
