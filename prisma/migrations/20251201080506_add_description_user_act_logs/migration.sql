/*
  Warnings:

  - Added the required column `description` to the `user_activity_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_activity_logs" ADD COLUMN     "description" TEXT NOT NULL;
