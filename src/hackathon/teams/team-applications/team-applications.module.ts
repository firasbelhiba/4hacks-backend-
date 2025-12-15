import { Module } from '@nestjs/common';
import { TeamApplicationsService } from './team-applications.service';
import { EmailModule } from 'src/email/email.module';
import { TeamApplicationsController } from './team-applications.controller';

@Module({
  imports: [EmailModule],
  providers: [TeamApplicationsService],
  controllers: [TeamApplicationsController],
})
export class TeamApplicationsModule {}
