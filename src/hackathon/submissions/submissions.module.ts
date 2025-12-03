import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { HackathonSubmissionsController } from './hackathon-submissions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailModule } from 'src/email/email.module';
import { SubmissionsController } from './submissions.controller';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [SubmissionsService],
  controllers: [HackathonSubmissionsController, SubmissionsController],
})
export class SubmissionsModule {}
