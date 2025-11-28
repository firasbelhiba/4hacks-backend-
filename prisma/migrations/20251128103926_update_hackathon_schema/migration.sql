/*
  Warnings:

  - The values [GENERAL,SPONSOR] on the enum `PrizeType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `maxParticipants` on the `hackathons` table. All the data in the column will be lost.
  - You are about to drop the column `participantCount` on the `hackathons` table. All the data in the column will be lost.
  - You are about to drop the column `projectCount` on the `hackathons` table. All the data in the column will be lost.
  - The `location` column on the `hackathons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `awardedAt` on the `prize_winners` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `prize_winners` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `prize_winners` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `prizes` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `prizes` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `prizes` table. All the data in the column will be lost.
  - You are about to drop the column `winnersCount` on the `prizes` table. All the data in the column will be lost.
  - You are about to drop the column `prizeAmount` on the `tracks` table. All the data in the column will be lost.
  - You are about to drop the column `prizeToken` on the `tracks` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ActivityTargetType" AS ENUM ('PROJECT', 'HACKATHON', 'TRACK', 'BOUNTY', 'PRIZE', 'COMMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('PROTOTYPE', 'MVP', 'DEMO');

-- CreateEnum
CREATE TYPE "HackathonRequiredMaterials" AS ENUM ('VIDEO_DEMO', 'PITCH_DECK', 'GITHUB_REPOSITORY', 'TESTING_INSTRUCTIONS');

-- AlterEnum
BEGIN;
CREATE TYPE "PrizeType_new" AS ENUM ('TRACK', 'BOUNTY');
ALTER TABLE "public"."prizes" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "prizes" ALTER COLUMN "type" TYPE "PrizeType_new" USING ("type"::text::"PrizeType_new");
ALTER TYPE "PrizeType" RENAME TO "PrizeType_old";
ALTER TYPE "PrizeType_new" RENAME TO "PrizeType";
DROP TYPE "public"."PrizeType_old";
ALTER TABLE "prizes" ALTER COLUMN "type" SET DEFAULT 'TRACK';
COMMIT;

-- AlterTable
ALTER TABLE "hackathons" DROP COLUMN "maxParticipants",
DROP COLUMN "participantCount",
DROP COLUMN "projectCount",
ADD COLUMN     "eligibilityRequirements" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "invitePasscode" TEXT,
ADD COLUMN     "isProjectWhiteListEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxCustomTabs" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "maxTracksByProject" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "otherLocations" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "projectWhitelistEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "registrationQuestions" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "requiredSubmissionMaterials" "HackathonRequiredMaterials"[] DEFAULT ARRAY[]::"HackathonRequiredMaterials"[],
ADD COLUMN     "ressources" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "submissionGuidelines" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tagline" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "winnerAnnouncementDate" TIMESTAMP(3),
DROP COLUMN "location",
ADD COLUMN     "location" JSONB;

-- AlterTable
ALTER TABLE "prize_winners" DROP COLUMN "awardedAt",
DROP COLUMN "paidAt",
DROP COLUMN "rank",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "prizes" DROP COLUMN "currency",
DROP COLUMN "description",
DROP COLUMN "title",
DROP COLUMN "winnersCount",
ADD COLUMN     "bountyId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "token" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "type" SET DEFAULT 'TRACK';

-- AlterTable
ALTER TABLE "tracks" DROP COLUMN "prizeAmount",
DROP COLUMN "prizeToken";

-- CreateTable
CREATE TABLE "user_activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" "ActivityTargetType",
    "targetId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_registration_answers" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_registration_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_hackathon_tabs" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_hackathon_tabs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_question_threads" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_question_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_question_replies" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_question_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bounties" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewardToken" TEXT NOT NULL DEFAULT 'USD',
    "maxWinners" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bounties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_activity_logs_userId_idx" ON "user_activity_logs"("userId");

-- CreateIndex
CREATE INDEX "user_activity_logs_targetType_targetId_idx" ON "user_activity_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "user_activity_logs_createdAt_idx" ON "user_activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "hackathon_registration_answers_hackathonId_idx" ON "hackathon_registration_answers"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_registration_answers_userId_idx" ON "hackathon_registration_answers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_registration_answers_hackathonId_userId_key" ON "hackathon_registration_answers"("hackathonId", "userId");

-- CreateIndex
CREATE INDEX "custom_hackathon_tabs_hackathonId_idx" ON "custom_hackathon_tabs"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_question_threads_hackathonId_idx" ON "hackathon_question_threads"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_question_replies_threadId_idx" ON "hackathon_question_replies"("threadId");

-- CreateIndex
CREATE INDEX "hackathon_question_replies_parentId_idx" ON "hackathon_question_replies"("parentId");

-- CreateIndex
CREATE INDEX "bounties_hackathonId_idx" ON "bounties"("hackathonId");

-- CreateIndex
CREATE INDEX "bounties_sponsorId_idx" ON "bounties"("sponsorId");

-- CreateIndex
CREATE INDEX "sponsors_name_idx" ON "sponsors"("name");

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registration_answers" ADD CONSTRAINT "hackathon_registration_answers_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registration_answers" ADD CONSTRAINT "hackathon_registration_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_hackathon_tabs" ADD CONSTRAINT "custom_hackathon_tabs_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_question_threads" ADD CONSTRAINT "hackathon_question_threads_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_question_threads" ADD CONSTRAINT "hackathon_question_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_question_replies" ADD CONSTRAINT "hackathon_question_replies_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "hackathon_question_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_question_replies" ADD CONSTRAINT "hackathon_question_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_question_replies" ADD CONSTRAINT "hackathon_question_replies_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "hackathon_question_replies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "bounties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bounties" ADD CONSTRAINT "bounties_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bounties" ADD CONSTRAINT "bounties_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "sponsors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
