/*
  Warnings:

  - You are about to drop the column `judgeId` on the `submission_scores` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[submissionId,hackathonJudgeId]` on the table `submission_scores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hackathonJudgeId` to the `submission_scores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "submission_scores" DROP CONSTRAINT "submission_scores_judgeId_fkey";

-- DropIndex
DROP INDEX "submission_scores_judgeId_idx";

-- DropIndex
DROP INDEX "submission_scores_submissionId_judgeId_key";

-- AlterTable
ALTER TABLE "submission_scores" DROP COLUMN "judgeId",
ADD COLUMN     "hackathonJudgeId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "submission_scores_hackathonJudgeId_idx" ON "submission_scores"("hackathonJudgeId");

-- CreateIndex
CREATE UNIQUE INDEX "submission_scores_submissionId_hackathonJudgeId_key" ON "submission_scores"("submissionId", "hackathonJudgeId");

-- AddForeignKey
ALTER TABLE "submission_scores" ADD CONSTRAINT "submission_scores_hackathonJudgeId_fkey" FOREIGN KEY ("hackathonJudgeId") REFERENCES "hackathon_judges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
