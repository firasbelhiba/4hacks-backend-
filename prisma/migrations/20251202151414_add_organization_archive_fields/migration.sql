-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "organizations_isArchived_idx" ON "organizations"("isArchived");
