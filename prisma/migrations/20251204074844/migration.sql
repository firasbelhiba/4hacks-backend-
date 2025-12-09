/*
  Warnings:

  - A unique constraint covering the columns `[prizeId]` on the table `prize_winners` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "prize_winners_prizeId_key" ON "prize_winners"("prizeId");

-- CreateIndex
CREATE INDEX "prizes_bountyId_idx" ON "prizes"("bountyId");
