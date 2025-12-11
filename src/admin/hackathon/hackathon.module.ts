import { Module } from '@nestjs/common';
import { AdminHackathonController } from './hackathon.controller';
import { AdminHackathonService } from './hackathon.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [AdminHackathonController],
  providers: [AdminHackathonService],
})
export class AdminHackathonModule {}
