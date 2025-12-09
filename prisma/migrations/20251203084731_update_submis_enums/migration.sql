/*
  Warnings:

  - The values [APPROVED] on the enum `SubmissionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityTargetType" ADD VALUE 'TEAM';
ALTER TYPE "ActivityTargetType" ADD VALUE 'SUBMISSION';
ALTER TYPE "ActivityTargetType" ADD VALUE 'HACKATHON_REGISTRATION';

-- AlterEnum
BEGIN;
CREATE TYPE "SubmissionStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REJECTED', 'WITHDRAWN');
ALTER TABLE "public"."submissions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "submissions" ALTER COLUMN "status" TYPE "SubmissionStatus_new" USING ("status"::text::"SubmissionStatus_new");
ALTER TYPE "SubmissionStatus" RENAME TO "SubmissionStatus_old";
ALTER TYPE "SubmissionStatus_new" RENAME TO "SubmissionStatus";
DROP TYPE "public"."SubmissionStatus_old";
ALTER TABLE "submissions" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "reviewReason" TEXT;
