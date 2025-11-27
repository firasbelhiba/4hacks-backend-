-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "HackathonStatus" AS ENUM ('DRAFT', 'UPCOMING', 'REGISTRATION', 'ACTIVE', 'JUDGING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HackathonType" AS ENUM ('IN_PERSON', 'VIRTUAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DISQUALIFIED', 'WINNER', 'FINALIST', 'PARTICIPANT');

-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_ownerId_fkey";

-- CreateTable
CREATE TABLE "hackathons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "banner" TEXT,
    "description" TEXT,
    "location" TEXT,
    "type" "HackathonType" NOT NULL DEFAULT 'VIRTUAL',
    "status" "HackathonStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prizePool" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "registrationStart" TIMESTAMP(3) NOT NULL,
    "registrationEnd" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "judgingStart" TIMESTAMP(3),
    "judgingEnd" TIMESTAMP(3),
    "maxTeamSize" INTEGER NOT NULL DEFAULT 4,
    "minTeamSize" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "trackId" TEXT,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "demoUrl" TEXT,
    "videoUrl" TEXT,
    "repoUrl" TEXT,
    "pitchUrl" TEXT,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hackathons_slug_key" ON "hackathons"("slug");

-- CreateIndex
CREATE INDEX "hackathons_slug_idx" ON "hackathons"("slug");

-- CreateIndex
CREATE INDEX "hackathons_organizationId_idx" ON "hackathons"("organizationId");

-- CreateIndex
CREATE INDEX "hackathons_status_isPublic_idx" ON "hackathons"("status", "isPublic");

-- CreateIndex
CREATE INDEX "hackathons_startDate_endDate_idx" ON "hackathons"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "tracks_hackathonId_idx" ON "tracks"("hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_hackathonId_slug_key" ON "tracks"("hackathonId", "slug");

-- CreateIndex
CREATE INDEX "projects_hackathonId_status_idx" ON "projects"("hackathonId", "status");

-- CreateIndex
CREATE INDEX "projects_trackId_idx" ON "projects"("trackId");

-- CreateIndex
CREATE INDEX "projects_creatorId_idx" ON "projects"("creatorId");

-- CreateIndex
CREATE INDEX "projects_submittedAt_idx" ON "projects"("submittedAt");

-- CreateIndex
CREATE INDEX "teams_hackathonId_idx" ON "teams"("hackathonId");

-- CreateIndex
CREATE INDEX "team_members_teamId_idx" ON "team_members"("teamId");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
