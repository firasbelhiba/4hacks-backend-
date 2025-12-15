import { Module } from '@nestjs/common';
import { HackathonRegistrationService } from './hackathon-registration.service';
import { HackathonRegistrationController } from './hackathon-registration.controller';
import { HackathonRegistrationQuestionService } from './hackathon-registration-question.service';
import { HackathonRegistrationQuestionController } from './hackathon-registration-question.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HackathonRegistrationService, HackathonRegistrationQuestionService],
  controllers: [
    HackathonRegistrationController,
    HackathonRegistrationQuestionController,
  ],
})
export class HackathonRegistrationModule {}
