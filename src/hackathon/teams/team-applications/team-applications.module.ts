import { Module } from '@nestjs/common';
import { TeamApplicationsService } from './team-applications.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule],
  providers: [TeamApplicationsService]
})
export class TeamApplicationsModule {}
