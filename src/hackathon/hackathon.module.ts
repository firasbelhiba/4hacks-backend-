import { Module } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HackathonService],
  controllers: [HackathonController]
})
export class HackathonModule {}
