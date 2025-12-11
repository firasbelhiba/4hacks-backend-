import {
  BadRequestException,
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

  async acceptJudgeInvitation(inviteId: string, requesterUser: UserMin) {
    const judgeInvitation = await this.prismaService.judgeInvitation.findUnique(
      {
        where: {
          id: inviteId,
        },
      },
    );

    // Check if the invitation exists
    if (!judgeInvitation) {
      throw new NotFoundException('Judge invitation not found');
    }

    // Check if the invitation is pending
    if (judgeInvitation.status !== JudgeInvitationStatus.PENDING) {
      throw new BadRequestException('Judge invitation is not pending');
    }

    // Check if the requester is the invited user
    if (judgeInvitation.invitedUserId !== requesterUser.id) {
      throw new ForbiddenException('You are not the invited user');
    }

    // Accept teh invitation, create new judge, store the activity log and send the notification
    const updatedJudgeInvitation = await this.prismaService.$transaction(
      async (tx) => {
        const updatedJudgeInvitation = await tx.judgeInvitation.update({
          where: {
            id: inviteId,
          },
          data: {
            status: JudgeInvitationStatus.ACCEPTED,
            respondedAt: new Date(),
          },
        });

        await tx.hackathonJudge.create({
          data: {
            hackathonId: judgeInvitation.hackathonId,
            userId: judgeInvitation.invitedUserId,
          },
        });

        // Store activity log
        await tx.userActivityLog.create({
          data: {
            userId: requesterUser.id,
            action: 'JUDGE_ACCEPT_INVITATION',
            description: `Accepted judge invitation ${inviteId}`,
            metadata: {
              hackathonId: judgeInvitation.hackathonId,
              judgeId: judgeInvitation.invitedUserId,
            },
          },
        });

        // Add a notification to the judge
        await tx.notification.create({
          data: {
            toUserId: judgeInvitation.invitedById,
            fromUserId: requesterUser.id,
            type: 'JUDGE_ACCEPT_INVITATION',
            content: `${requesterUser.name} has accepted your judge invitation ${inviteId} into hackathon ${judgeInvitation.hackathonId}`,
            payload: {
              hackathonId: judgeInvitation.hackathonId,
              judgeId: judgeInvitation.invitedUserId,
              judgeInvitationId: inviteId,
            },
          },
        });

        return updatedJudgeInvitation;
      },
    );

    return {
      message: 'Judge invitation accepted successfully',
      data: updatedJudgeInvitation,
    };
  }

  async declineJudgeInvitation(inviteId: string, requesterUser: UserMin) {
    const judgeInvitation = await this.prismaService.judgeInvitation.findUnique(
      {
        where: {
          id: inviteId,
        },
      },
    );

    // Check if the invitation exists
    if (!judgeInvitation) {
      throw new NotFoundException('Judge invitation not found');
    }

    // Check if the invitation is pending
    if (judgeInvitation.status !== JudgeInvitationStatus.PENDING) {
      throw new BadRequestException('Judge invitation is not pending');
    }

    // Check if the requester is the invited user
    if (judgeInvitation.invitedUserId !== requesterUser.id) {
      throw new ForbiddenException('You are not the invited user');
    }

    // Accept teh invitation, create new judge, store the activity log and send the notification
    const updatedJudgeInvitation = await this.prismaService.$transaction(
      async (tx) => {
        const updatedJudgeInvitation = await tx.judgeInvitation.update({
          where: {
            id: inviteId,
          },
          data: {
            status: JudgeInvitationStatus.DECLINED,
            respondedAt: new Date(),
          },
        });

        // Store activity log
        await tx.userActivityLog.create({
          data: {
            userId: requesterUser.id,
            action: 'JUDGE_REJECT_INVITATION',
            description: `Rejected judge invitation ${inviteId}`,
            metadata: {
              hackathonId: judgeInvitation.hackathonId,
              judgeId: judgeInvitation.invitedUserId,
            },
          },
        });

        // Add a notification to the judge
        await tx.notification.create({
          data: {
            toUserId: judgeInvitation.invitedById,
            fromUserId: requesterUser.id,
            type: 'JUDGE_REJECT_INVITATION',
            content: `${requesterUser.name} has rejected your judge invitation ${inviteId} into hackathon ${judgeInvitation.hackathonId}`,
            payload: {
              hackathonId: judgeInvitation.hackathonId,
              judgeId: judgeInvitation.invitedUserId,
              judgeInvitationId: inviteId,
            },
          },
        });

        return updatedJudgeInvitation;
      },
    );

    return {
      message: 'Judge invitation declined successfully',
      data: updatedJudgeInvitation,
    };
  }
}
