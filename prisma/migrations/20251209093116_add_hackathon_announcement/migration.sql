-- CreateEnum
CREATE TYPE "AnnouncementVisibility" AS ENUM ('PUBLIC', 'REGISTERED_ONLY');

-- CreateEnum
CREATE TYPE "AnnouncementTargetType" AS ENUM ('ALL', 'REGISTERED', 'SUBMITTED', 'TRACK', 'BOUNTY');

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "image" TEXT,
    "link" TEXT,
    "visibility" "AnnouncementVisibility" NOT NULL DEFAULT 'PUBLIC',
    "targetType" "AnnouncementTargetType" NOT NULL DEFAULT 'ALL',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "trackId" TEXT,
    "bountyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcements_hackathonId_idx" ON "announcements"("hackathonId");

-- CreateIndex
CREATE INDEX "announcements_createdById_idx" ON "announcements"("createdById");

-- CreateIndex
CREATE INDEX "announcements_isPinned_idx" ON "announcements"("isPinned");

-- CreateIndex
CREATE INDEX "announcements_visibility_idx" ON "announcements"("visibility");

-- CreateIndex
CREATE INDEX "announcements_targetType_idx" ON "announcements"("targetType");

-- CreateIndex
CREATE INDEX "announcements_trackId_idx" ON "announcements"("trackId");

-- CreateIndex
CREATE INDEX "announcements_bountyId_idx" ON "announcements"("bountyId");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "bounties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
