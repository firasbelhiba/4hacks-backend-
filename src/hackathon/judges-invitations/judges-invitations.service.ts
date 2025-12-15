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
import { HackathonMin, UserMin, ActivityTargetType } from 'src/common/types';
import { JudgeInvitationStatus } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import {
  JudgeInvitationEmailTemplateHtml,
  JudgeInvitationAcceptedEmailTemplateHtml,
  JudgeInvitationDeclinedEmailTemplateHtml,
} from 'src/common/templates/emails/judges.emails';

@Injectable()
export class JudgesInvitationsService {
  private readonly logger = new Logger(JudgesInvitationsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

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
        email: true,
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
            targetId: judgeInvitation.id,
            targetType: ActivityTargetType.JUDGE_INVITATION.toString(),
            description: `Invited judge ${judgeId} to hackathon ${hackathon.id}`,
            isPublic: false,
            metadata: {
              hackathonId: hackathon.id,
              judgeId,
              judgeInvitationId: judgeInvitation.id,
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
              judgeInvitationId: judgeInvitation.id,
            },
          },
        });

        return judgeInvitation;
      },
    );

    // Send an email to the judge
    try {
      const emailHtml = JudgeInvitationEmailTemplateHtml(
        judge.name || judge.username || 'Judge',
        requesterUser.name || requesterUser.username || 'Organizer',
        hackathon.title,
        hackathon.id,
        judgeInvitation.id,
      );

      await this.emailService.sendEmail(
        judge.email,
        `You're Invited to Judge ${hackathon.title}`,
        emailHtml,
      );
    } catch (error) {
      // Log the error
      this.logger.error('Failed to send invitation email to judge', error);
    }

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
        include: {
          invitedBy: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          hackathon: {
            select: {
              id: true,
              title: true,
            },
          },
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

    // Send an email to the organizer who invited the judge
    try {
      const emailHtml = JudgeInvitationAcceptedEmailTemplateHtml(
        judgeInvitation.invitedBy.name ||
          judgeInvitation.invitedBy.username ||
          'Organizer',
        requesterUser.name || requesterUser.username || 'Judge',
        judgeInvitation.hackathon.title,
        judgeInvitation.hackathon.id,
      );

      await this.emailService.sendEmail(
        judgeInvitation.invitedBy.email,
        `${requesterUser.name || requesterUser.username || 'A user'} Accepted Your Judge Invitation`,
        emailHtml,
      );
    } catch (error) {
      this.logger.error(
        'Failed to send judge invitation accepted email',
        error,
      );
    }

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
        include: {
          invitedBy: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
          hackathon: {
            select: {
              id: true,
              title: true,
            },
          },
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

    // Send an email to the organizer who invited the judge
    try {
      const emailHtml = JudgeInvitationDeclinedEmailTemplateHtml(
        judgeInvitation.invitedBy.name ||
          judgeInvitation.invitedBy.username ||
          'Organizer',
        requesterUser.name || requesterUser.username || 'Judge',
        judgeInvitation.hackathon.title,
        judgeInvitation.hackathon.id,
      );

      await this.emailService.sendEmail(
        judgeInvitation.invitedBy.email,
        `${requesterUser.name || requesterUser.username || 'A user'} Declined Your Judge Invitation`,
        emailHtml,
      );
    } catch (error) {
      this.logger.error(
        'Failed to send judge invitation declined email',
        error,
      );
    }

    return {
      message: 'Judge invitation declined successfully',
      data: updatedJudgeInvitation,
    };
  }
}
