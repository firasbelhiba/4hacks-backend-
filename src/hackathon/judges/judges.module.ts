import { Module } from '@nestjs/common';
import { JudgesService } from './judges.service';
import { JudgesController } from './judges.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [JudgesService],
  controllers: [JudgesController],
})
export class JudgesModule {}
