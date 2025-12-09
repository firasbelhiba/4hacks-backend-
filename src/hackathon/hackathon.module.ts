import { Module } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HackathonRegistrationModule } from './hackathon-registration/hackathon-registration.module';
import { TeamsModule } from './teams/teams.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { PrizesModule } from './prizes/prizes.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [
    PrismaModule,
    HackathonRegistrationModule,
    TeamsModule,
    SubmissionsModule,
    PrizesModule,
    AnnouncementsModule,
  ],
  providers: [HackathonService],
  controllers: [HackathonController],
})
export class HackathonModule {}
