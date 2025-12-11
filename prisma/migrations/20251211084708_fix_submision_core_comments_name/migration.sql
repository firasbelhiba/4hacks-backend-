/*
  Warnings:

  - You are about to drop the column `comments` on the `submission_scores` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ActivityTargetType" ADD VALUE 'JUDGE_SUBMISSION_SCORE';

-- AlterTable
ALTER TABLE "submission_scores" DROP COLUMN "comments",
ADD COLUMN     "comment" TEXT;
