import { Module } from '@nestjs/common';
import { HackathonRequestsModule } from './hackathon-requests/hackathon-requests.module';
import { UsersModule } from './users/users.module';
import { AdminHackathonModule } from './hackathon/hackathon.module';

@Module({
  imports: [HackathonRequestsModule, UsersModule, AdminHackathonModule],
})
export class AdminModule {}
