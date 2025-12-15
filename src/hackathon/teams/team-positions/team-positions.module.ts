import { Module } from '@nestjs/common';
import { TeamPositionsService } from './team-positions.service';
import { TeamPositionsController } from './team-positions.controller';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule],
  providers: [TeamPositionsService],
  controllers: [TeamPositionsController],
})
export class TeamPositionsModule {}
