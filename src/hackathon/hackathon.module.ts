import { Module } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RequestModule } from './request/request.module';

@Module({
  imports: [PrismaModule, RequestModule],
  providers: [HackathonService],
  controllers: [HackathonController]
})
export class HackathonModule {}
