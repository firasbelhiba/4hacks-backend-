import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { EmailModule } from 'src/email/email.module';
import { TeamPositionsModule } from './team-positions/team-positions.module';
import { TeamApplicationsController } from './team-applications/team-applications.controller';
import { TeamApplicationsModule } from './team-applications/team-applications.module';

@Module({
  imports: [
    PrismaModule,
    FileUploadModule,
    EmailModule,
    TeamPositionsModule,
    TeamApplicationsModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
