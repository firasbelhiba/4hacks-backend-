import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InviteJudgeDto } from './dto/invite.dto';
import { HackathonMin, UserMin } from 'src/common/types';
import { JudgeInvitationStatus } from '@prisma/client';

@Injectable()
export class JudgesService {
  private readonly logger = new Logger(JudgesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async inviteJudge(
    inviteJudgeDto: InviteJudgeDto,
    requesterUser: UserMin,
    hackathon: HackathonMin,
  ) {
    const { judgeId } = inviteJudgeDto;

    // Check if the requester is the owner of teh organization of the hackathon
    if (requesterUser.id !== hackathon.organization.ownerId) {
      throw new ForbiddenException('You are not the owner of this hackathon');
    }

    // Check if teh judge is valid user
    const judge = await this.prismaService.users.findUnique({
      where: {
        id: judgeId,
      },
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    if (!judge) {
      throw new NotFoundException('Judge not found');
    }

    // Check if the judge is already invited for this hackathon (pending or accepted)
    const existingJudge = await this.prismaService.judgeInvitation.findFirst({
      where: {
        hackathonId: hackathon.id,
        invitedUserId: judgeId,
        status: {
          in: [JudgeInvitationStatus.PENDING, JudgeInvitationStatus.ACCEPTED],
        },
      },
    });

    if (existingJudge) {
      throw new ConflictException(
        'Judge is already invited to this hackathon or is already a judge.',
      );
    }

    // Create judge invitation, store activity log and send notification
    const judgeInvitation = await this.prismaService.$transaction(
      async (tx) => {
        const judgeInvitation = await tx.judgeInvitation.create({
          data: {
            hackathonId: hackathon.id,
            invitedUserId: judgeId,
            invitedById: requesterUser.id,
          },
        });

        // Store activity log
        await tx.userActivityLog.create({
          data: {
            userId: requesterUser.id,
            action: 'JUDGE_INVITE',
            description: `Invited judge ${judgeId} to hackathon ${hackathon.id}`,
            metadata: {
              hackathonId: hackathon.id,
              judgeId,
            },
          },
        });

        // Add a notification to the judge
        await tx.notification.create({
          data: {
            toUserId: judgeId,
            fromUserId: requesterUser.id,
            type: 'JUDGE_INVITATION',
            content: `You have been invited to judge hackathon ${hackathon.title} by ${requesterUser.username}`,
            payload: {
              hackathonId: hackathon.id,
              judgeId,
            },
          },
        });

        return judgeInvitation;
      },
    );

    return {
      message: 'Judge invited successfully',
      data: judgeInvitation,
    };
  }
}
