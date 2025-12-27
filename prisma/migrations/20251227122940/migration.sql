-- CreateTable
CREATE TABLE "submission_bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submission_bookmarks_userId_idx" ON "submission_bookmarks"("userId");

-- CreateIndex
CREATE INDEX "submission_bookmarks_submissionId_idx" ON "submission_bookmarks"("submissionId");

-- CreateIndex
CREATE INDEX "submission_bookmarks_userId_submissionId_idx" ON "submission_bookmarks"("userId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "submission_bookmarks_userId_submissionId_key" ON "submission_bookmarks"("userId", "submissionId");

-- AddForeignKey
ALTER TABLE "submission_bookmarks" ADD CONSTRAINT "submission_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_bookmarks" ADD CONSTRAINT "submission_bookmarks_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
