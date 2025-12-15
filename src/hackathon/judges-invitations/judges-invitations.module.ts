import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { JudgesInvitationsService } from './judges-invitations.service';
import { JudgesInvitationsController } from './judges-invitations.controller';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [JudgesInvitationsService],
  controllers: [JudgesInvitationsController],
})
export class JudgesInvitationsModule {}
