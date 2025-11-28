import { Module } from '@nestjs/common';
import { HackathonRequestsModule } from './hackathon-requests/hackathon-requests.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [HackathonRequestsModule, UsersModule],
})
export class AdminModule {}
