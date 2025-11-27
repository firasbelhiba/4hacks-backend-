-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "revokedById" TEXT;

-- CreateTable
CREATE TABLE "failed_logins" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_logins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "failed_logins_email_idx" ON "failed_logins"("email");

-- CreateIndex
CREATE INDEX "failed_logins_userId_idx" ON "failed_logins"("userId");

-- CreateIndex
CREATE INDEX "failed_logins_createdAt_idx" ON "failed_logins"("createdAt");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "failed_logins" ADD CONSTRAINT "failed_logins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
