/*
  Warnings:

  - You are about to drop the column `hackCategory` on the `hackathon_creation_requests` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `hackathons` table. All the data in the column will be lost.
  - Added the required column `hackCategoryId` to the `hackathon_creation_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `hackathons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hackathon_creation_requests" DROP COLUMN "hackCategory",
ADD COLUMN     "hackCategoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "hackathons" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "HackathonCategory";

-- CreateTable
CREATE TABLE "HackathonCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HackathonCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HackathonCategory_name_key" ON "HackathonCategory"("name");

-- AddForeignKey
ALTER TABLE "hackathon_creation_requests" ADD CONSTRAINT "hackathon_creation_requests_hackCategoryId_fkey" FOREIGN KEY ("hackCategoryId") REFERENCES "HackathonCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HackathonCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
