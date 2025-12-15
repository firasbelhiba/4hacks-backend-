/*
  Warnings:

  - You are about to drop the column `answers` on the `hackathon_registration_answers` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `hackathon_registration_answers` table. All the data in the column will be lost.
  - You are about to drop the column `registrationQuestions` on the `hackathons` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registrationId,questionId]` on the table `hackathon_registration_answers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionId` to the `hackathon_registration_answers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RegistrationQuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'CHECKBOX');

-- DropIndex
DROP INDEX "hackathon_registration_answers_registrationId_key";

-- AlterTable
ALTER TABLE "hackathon_registration_answers" DROP COLUMN "answers",
DROP COLUMN "submittedAt",
ADD COLUMN     "questionId" TEXT NOT NULL,
ADD COLUMN     "value" TEXT[];

-- AlterTable
ALTER TABLE "hackathons" DROP COLUMN "registrationQuestions";

-- CreateTable
CREATE TABLE "hackathon_registration_questions" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "type" "RegistrationQuestionType" NOT NULL DEFAULT 'TEXT',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_registration_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hackathon_registration_questions_hackathonId_idx" ON "hackathon_registration_questions"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_registration_questions_hackathonId_order_idx" ON "hackathon_registration_questions"("hackathonId", "order");

-- CreateIndex
CREATE INDEX "hackathon_registration_answers_questionId_idx" ON "hackathon_registration_answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_registration_answers_registrationId_questionId_key" ON "hackathon_registration_answers"("registrationId", "questionId");

-- AddForeignKey
ALTER TABLE "hackathon_registration_questions" ADD CONSTRAINT "hackathon_registration_questions_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registration_answers" ADD CONSTRAINT "hackathon_registration_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "hackathon_registration_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
