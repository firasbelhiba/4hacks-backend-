import { Module } from '@nestjs/common';
import { HackathonRequestController } from './hackathon-request.controller';
import { HackathonRequestService } from './hackathon-request.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HackathonRequestController],
  providers: [HackathonRequestService],
})
export class HackathonRequestModule {}
