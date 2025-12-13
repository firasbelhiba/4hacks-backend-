import { Module } from '@nestjs/common';
import { HackathonFaqService } from './hackathon-faq.service';
import { HackathonFaqController } from './hackathon-faq.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HackathonFaqService],
  controllers: [HackathonFaqController],
})
export class HackathonFaqModule {}
