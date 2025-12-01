import { Module } from '@nestjs/common';
import { HackathonRegistrationService } from './hackathon-registration.service';
import { HackathonRegistrationController } from './hackathon-registration.controller';

@Module({
  providers: [HackathonRegistrationService],
  controllers: [HackathonRegistrationController]
})
export class HackathonRegistrationModule {}
