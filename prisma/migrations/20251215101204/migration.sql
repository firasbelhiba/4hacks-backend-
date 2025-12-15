/*
  Warnings:

  - The `targetType` column on the `user_activity_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TeamPositionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "TeamApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "user_activity_logs" DROP COLUMN "targetType",
ADD COLUMN     "targetType" TEXT;

-- DropEnum
DROP TYPE "ActivityTargetType";

-- CreateTable
CREATE TABLE "team_positions" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "TeamPositionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_applications" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TeamApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "decidedAt" TIMESTAMP(3),
    "decidedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usersId" TEXT,

    CONSTRAINT "team_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_positions_teamId_idx" ON "team_positions"("teamId");

-- CreateIndex
CREATE INDEX "team_positions_status_idx" ON "team_positions"("status");

-- CreateIndex
CREATE INDEX "team_applications_userId_idx" ON "team_applications"("userId");

-- CreateIndex
CREATE INDEX "team_applications_positionId_status_idx" ON "team_applications"("positionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "team_applications_positionId_userId_key" ON "team_applications"("positionId", "userId");

-- CreateIndex
CREATE INDEX "user_activity_logs_targetType_targetId_idx" ON "user_activity_logs"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "team_positions" ADD CONSTRAINT "team_positions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_positions" ADD CONSTRAINT "team_positions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_applications" ADD CONSTRAINT "team_applications_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "team_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_applications" ADD CONSTRAINT "team_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_applications" ADD CONSTRAINT "team_applications_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
