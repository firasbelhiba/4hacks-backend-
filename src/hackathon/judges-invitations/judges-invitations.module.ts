import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { JudgesInvitationsService } from './judges-invitations.service';
import { JudgesInvitationsController } from './judges-invitations.controller';

@Module({
  imports: [PrismaModule],
  providers: [JudgesInvitationsService],
  controllers: [JudgesInvitationsController],
})
export class JudgesInvitationsModule {}
