/*
  Warnings:

  - The values [UPCOMING,REGISTRATION,JUDGING,COMPLETED] on the enum `HackathonStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HackathonStatus_new" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'CANCELLED');
ALTER TABLE "public"."hackathons" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "hackathons" ALTER COLUMN "status" TYPE "HackathonStatus_new" USING ("status"::text::"HackathonStatus_new");
ALTER TYPE "HackathonStatus" RENAME TO "HackathonStatus_old";
ALTER TYPE "HackathonStatus_new" RENAME TO "HackathonStatus";
DROP TYPE "public"."HackathonStatus_old";
ALTER TABLE "hackathons" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
