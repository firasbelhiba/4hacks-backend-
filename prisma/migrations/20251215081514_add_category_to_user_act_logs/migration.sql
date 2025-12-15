-- AlterEnum
ALTER TYPE "ActivityTargetType" ADD VALUE 'CATEGORY';

-- AlterTable
ALTER TABLE "user_activity_logs" ALTER COLUMN "isPublic" SET DEFAULT false;
