/*
  Warnings:

  - You are about to drop the column `bountyId` on the `submissions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_bountyId_fkey";

-- DropIndex
DROP INDEX "submissions_bountyId_idx";

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "bountyId";

-- CreateTable
CREATE TABLE "submission_bounties" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "bountyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_bounties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submission_bounties_submissionId_idx" ON "submission_bounties"("submissionId");

-- CreateIndex
CREATE INDEX "submission_bounties_bountyId_idx" ON "submission_bounties"("bountyId");

-- CreateIndex
CREATE UNIQUE INDEX "submission_bounties_submissionId_bountyId_key" ON "submission_bounties"("submissionId", "bountyId");

-- AddForeignKey
ALTER TABLE "submission_bounties" ADD CONSTRAINT "submission_bounties_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_bounties" ADD CONSTRAINT "submission_bounties_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "bounties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
