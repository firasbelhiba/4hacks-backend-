import { Module } from '@nestjs/common';
import { HackathonRequestsModule } from './hackathon-requests/hackathon-requests.module';

@Module({
  imports: [HackathonRequestsModule]
})
export class AdminModule {}
