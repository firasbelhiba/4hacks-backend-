import { Module } from '@nestjs/common';
import { HackathonRequestsController } from './hackathon-requests.controller';
import { HackathonRequestsService } from './hackathon-requests.service';

@Module({
  controllers: [HackathonRequestsController],
  providers: [HackathonRequestsService]
})
export class HackathonRequestsModule {}
