import { Module } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { TracksPrizesController } from './tracks-prizes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BountiesPrizesController } from './bounties-prizes.controller';
import { PrizesController } from './prizes.controller';

@Module({
  imports: [PrismaModule],
  providers: [PrizesService],
  controllers: [
    TracksPrizesController,
    BountiesPrizesController,
    PrizesController,
  ],
})
export class PrizesModule {}
