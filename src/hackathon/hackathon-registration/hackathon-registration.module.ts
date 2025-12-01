import { Module } from '@nestjs/common';
import { HackathonRegistrationService } from './hackathon-registration.service';
import { HackathonRegistrationController } from './hackathon-registration.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HackathonRegistrationService],
  controllers: [HackathonRegistrationController],
})
export class HackathonRegistrationModule {}
