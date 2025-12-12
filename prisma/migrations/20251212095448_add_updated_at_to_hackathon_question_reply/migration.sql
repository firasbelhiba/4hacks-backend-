/*
  Warnings:

  - Added the required column `updatedAt` to the `hackathon_question_replies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hackathon_question_replies" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
