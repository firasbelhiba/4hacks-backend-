import { Module } from '@nestjs/common';
import { TeamPositionsService } from './team-positions.service';
import { TeamPositionsController } from './team-positions.controller';

@Module({
  providers: [TeamPositionsService],
  controllers: [TeamPositionsController]
})
export class TeamPositionsModule {}
