/*
  Warnings:

  - A unique constraint covering the columns `[hackathonId,slug]` on the table `custom_hackathon_tabs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "hackathon_question_replies" DROP CONSTRAINT "hackathon_question_replies_userId_fkey";

-- DropForeignKey
ALTER TABLE "hackathon_question_threads" DROP CONSTRAINT "hackathon_question_threads_userId_fkey";

-- DropIndex
DROP INDEX "custom_hackathon_tabs_hackathonId_idx";

-- DropIndex
DROP INDEX "hackathon_registrations_hackathonId_idx";

-- DropIndex
DROP INDEX "hackathon_registrations_userId_idx";

-- AlterTable
ALTER TABLE "custom_hackathon_tabs" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "hackathon_question_threads" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "hackathon_registration_answers" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "prizes" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "tracks" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "custom_hackathon_tabs_hackathonId_slug_key" ON "custom_hackathon_tabs"("hackathonId", "slug");

-- CreateIndex
CREATE INDEX "hackathon_creation_requests_organizationId_status_idx" ON "hackathon_creation_requests"("organizationId", "status");

-- CreateIndex
CREATE INDEX "hackathon_question_replies_userId_idx" ON "hackathon_question_replies"("userId");

-- CreateIndex
CREATE INDEX "hackathon_question_replies_threadId_userId_idx" ON "hackathon_question_replies"("threadId", "userId");

-- CreateIndex
CREATE INDEX "hackathon_registrations_hackathonId_userId_idx" ON "hackathon_registrations"("hackathonId", "userId");

-- CreateIndex
CREATE INDEX "notifications_toUserId_isRead_idx" ON "notifications"("toUserId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "sponsors_hackathonId_idx" ON "sponsors"("hackathonId");

-- CreateIndex
CREATE INDEX "submissions_bountyId_idx" ON "submissions"("bountyId");

-- CreateIndex
CREATE INDEX "submissions_hackathonId_teamId_idx" ON "submissions"("hackathonId", "teamId");

-- CreateIndex
CREATE INDEX "submissions_trackId_status_idx" ON "submissions"("trackId", "status");

-- CreateIndex
CREATE INDEX "team_members_userId_teamId_idx" ON "team_members"("userId", "teamId");

-- CreateIndex
CREATE INDEX "tracks_hackathonId_order_idx" ON "tracks"("hackathonId", "order");

-- AddForeignKey
ALTER TABLE "hackathon_question_threads" ADD CONSTRAINT "hackathon_question_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_question_replies" ADD CONSTRAINT "hackathon_question_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
