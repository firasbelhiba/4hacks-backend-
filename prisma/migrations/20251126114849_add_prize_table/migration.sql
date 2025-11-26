-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('GENERAL', 'TRACK', 'BOUNTY', 'SPONSOR');

-- CreateTable
CREATE TABLE "prizes" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "trackId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PrizeType" NOT NULL DEFAULT 'GENERAL',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "winnersCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_winners" (
    "id" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "prize_winners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prizes_hackathonId_idx" ON "prizes"("hackathonId");

-- CreateIndex
CREATE INDEX "prizes_trackId_idx" ON "prizes"("trackId");

-- CreateIndex
CREATE INDEX "prize_winners_prizeId_idx" ON "prize_winners"("prizeId");

-- CreateIndex
CREATE INDEX "prize_winners_projectId_idx" ON "prize_winners"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "prize_winners_prizeId_projectId_key" ON "prize_winners"("prizeId", "projectId");

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_winners" ADD CONSTRAINT "prize_winners_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_winners" ADD CONSTRAINT "prize_winners_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
