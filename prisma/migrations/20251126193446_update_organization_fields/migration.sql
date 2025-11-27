/*
  Warnings:

  - You are about to drop the column `location` on the `organizations` table. All the data in the column will be lost.
  - Added the required column `city` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayName` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishedYear` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkedin` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Made the column `website` on table `organizations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `github` on table `organizations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `twitter` on table `organizations` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('ENTERPRISE', 'STARTUP', 'DAO', 'NON_PROFIT', 'EDUCATIONAL_INSTITUTION', 'GOVERNMENT_AGENCY', 'COMMUNITY_DEVELOPER_GROUP', 'BLOCKCHAIN_FOUNDATION', 'STUDENT_ORGANIZATION');

-- CreateEnum
CREATE TYPE "OrganizationSize" AS ENUM ('ONE_TO_TEN', 'ELEVEN_TO_FIFTY', 'FIFTY_ONE_TO_TWO_HUNDRED', 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED', 'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND', 'ONE_THOUSAND', 'COMMUNITY_DRIVEN');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('NORTH_AMERICA', 'SOUTH_AMERICA', 'EUROPE', 'AFRICA', 'ASIA', 'MIDDLE_EAST', 'OCEANIA', 'GLOBAL');

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "location",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "discord" TEXT,
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "establishedYear" INTEGER NOT NULL,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT NOT NULL,
ADD COLUMN     "loc_address" TEXT,
ADD COLUMN     "medium" TEXT,
ADD COLUMN     "operatingRegions" "Region"[] DEFAULT ARRAY[]::"Region"[],
ADD COLUMN     "otherSocials" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "reddit" TEXT,
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "size" "OrganizationSize" NOT NULL,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "type" "OrganizationType" NOT NULL,
ADD COLUMN     "warpcast" TEXT,
ADD COLUMN     "youtube" TEXT,
ADD COLUMN     "zipCode" TEXT,
ALTER COLUMN "website" SET NOT NULL,
ALTER COLUMN "github" SET NOT NULL,
ALTER COLUMN "twitter" SET NOT NULL;
