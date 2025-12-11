import { Module } from '@nestjs/common';
import { SubmissionScoresService } from './submission-scores.service';
import { SubmissionScoresController } from './submission-scores.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SubmissionScoresService],
  controllers: [SubmissionScoresController],
})
export class SubmissionScoresModule {}
