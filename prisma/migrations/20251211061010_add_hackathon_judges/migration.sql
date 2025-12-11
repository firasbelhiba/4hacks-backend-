-- CreateEnum
CREATE TYPE "JudgeInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "judge_invitations" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "invitedUserId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "JudgeInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judge_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_judges" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_judges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_scores" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "criteriaScores" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "judge_invitations_hackathonId_idx" ON "judge_invitations"("hackathonId");

-- CreateIndex
CREATE INDEX "judge_invitations_invitedUserId_idx" ON "judge_invitations"("invitedUserId");

-- CreateIndex
CREATE INDEX "judge_invitations_invitedById_idx" ON "judge_invitations"("invitedById");

-- CreateIndex
CREATE INDEX "judge_invitations_status_idx" ON "judge_invitations"("status");

-- CreateIndex
CREATE INDEX "hackathon_judges_hackathonId_idx" ON "hackathon_judges"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_judges_userId_idx" ON "hackathon_judges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_judges_hackathonId_userId_key" ON "hackathon_judges"("hackathonId", "userId");

-- CreateIndex
CREATE INDEX "submission_scores_submissionId_idx" ON "submission_scores"("submissionId");

-- CreateIndex
CREATE INDEX "submission_scores_judgeId_idx" ON "submission_scores"("judgeId");

-- CreateIndex
CREATE UNIQUE INDEX "submission_scores_submissionId_judgeId_key" ON "submission_scores"("submissionId", "judgeId");

-- AddForeignKey
ALTER TABLE "judge_invitations" ADD CONSTRAINT "judge_invitations_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_invitations" ADD CONSTRAINT "judge_invitations_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_invitations" ADD CONSTRAINT "judge_invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_judges" ADD CONSTRAINT "hackathon_judges_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_judges" ADD CONSTRAINT "hackathon_judges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_scores" ADD CONSTRAINT "submission_scores_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_scores" ADD CONSTRAINT "submission_scores_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "hackathon_judges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
