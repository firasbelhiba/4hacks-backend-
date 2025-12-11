import { Module } from '@nestjs/common';
import { HackathonRequestsController } from './hackathon-requests.controller';
import { HackathonRequestsService } from './hackathon-requests.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [HackathonRequestsController],
  providers: [HackathonRequestsService],
})
export class HackathonRequestsModule {}
