-- DropForeignKey
ALTER TABLE "hackathon_question_replies" DROP CONSTRAINT "hackathon_question_replies_parentId_fkey";

-- AddForeignKey
ALTER TABLE "hackathon_question_replies" ADD CONSTRAINT "hackathon_question_replies_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "hackathon_question_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
