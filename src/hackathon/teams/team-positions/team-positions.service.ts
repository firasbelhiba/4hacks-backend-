import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ActivityTargetType, UserMin } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamPositionDto } from './dto/create.dto';
import { UpdateTeamPositionDto } from './dto/update.dto';
import { TeamPositionStatus } from '@prisma/client';
import { ApplyToTeamPositionDto } from './dto/apply.dto';
import { EmailService } from 'src/email/email.service';
import { TeamPositionApplicationEmailTemplateHtml } from 'src/common/templates/emails/team.emails';

@Injectable()
export class TeamPositionsService {
  private readonly logger = new Logger(TeamPositionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(
    hackathonId: string,
    teamId: string,
    createTeamPositionDto: CreateTeamPositionDto,
    requesterUser: UserMin,
  ) {
    const { title, description, requiredSkills } = createTeamPositionDto;

    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        hackathon: {
          select: {
            id: true,
            maxTeamSize: true,
          },
        },
        members: {
          select: {
            id: true,
            userId: true,
            isLeader: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.hackathonId !== hackathonId) {
      throw new BadRequestException('Team is not associated to the hackathon');
    }

    // Check team members length is not more than hackathon max team length
    if (team.members.length >= team.hackathon.maxTeamSize) {
      throw new BadRequestException(
        'Team is full. Max team size is ' + team.hackathon.maxTeamSize,
      );
    }

    // Check if requester user is the leader of the team
    const isLeader = team.members.some(
      (member) => member.userId === requesterUser.id && member.isLeader,
    );

    if (!isLeader) {
      throw new ForbiddenException('You are not the leader of this team');
    }

    const teamPosition = await this.prisma.$transaction(async (tx) => {
      const teamPosition = await tx.teamPosition.create({
        data: {
          title,
          description,
          requiredSkills,
          teamId,
          createdById: requesterUser.id,
        },
      });

      // Store the activity logs
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'CREATE_TEAM_POSITION',
          isPublic: true,
          description: `Created team position ${title} for team ${team.name}`,
          targetType: ActivityTargetType.TEAM_POSITION.toString(),
          targetId: teamPosition.id,
        },
      });

      // TODO: notif all team members

      return teamPosition;
    });

    return {
      message: 'Team position created successfully',
      data: teamPosition,
    };
  }

  async update(
    hackathonId: string,
    teamId: string,
    positionId: string,
    updateTeamPositionDto: UpdateTeamPositionDto,
    requesterUser: UserMin,
  ) {
    // Find the team position with team details
    const teamPosition = await this.prisma.teamPosition.findUnique({
      where: {
        id: positionId,
      },
      include: {
        team: {
          include: {
            hackathon: {
              select: {
                id: true,
              },
            },
            members: {
              select: {
                id: true,
                userId: true,
                isLeader: true,
              },
            },
          },
        },
      },
    });

    if (!teamPosition) {
      throw new NotFoundException('Team position not found');
    }

    // Verify the position belongs to the specified team
    if (teamPosition.teamId !== teamId) {
      throw new BadRequestException(
        'Team position does not belong to this team',
      );
    }

    // Verify the team belongs to the specified hackathon
    if (teamPosition.team.hackathonId !== hackathonId) {
      throw new BadRequestException('Team is not associated to the hackathon');
    }

    // Check if requester user is the leader of the team
    const isLeader = teamPosition.team.members.some(
      (member) => member.userId === requesterUser.id && member.isLeader,
    );

    if (!isLeader) {
      throw new ForbiddenException('You are not the leader of this team');
    }

    // Update the team position
    const updatedTeamPosition = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.teamPosition.update({
        where: {
          id: positionId,
        },
        data: {
          ...(updateTeamPositionDto.title !== undefined && {
            title: updateTeamPositionDto.title,
          }),
          ...(updateTeamPositionDto.description !== undefined && {
            description: updateTeamPositionDto.description,
          }),
          ...(updateTeamPositionDto.requiredSkills !== undefined && {
            requiredSkills: updateTeamPositionDto.requiredSkills,
          }),
          ...(updateTeamPositionDto.status !== undefined && {
            status: updateTeamPositionDto.status,
          }),
        },
      });

      // Store the activity log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'UPDATE_TEAM_POSITION',
          isPublic: true,
          description: `Updated team position ${updated.title} for team ${teamPosition.team.name}`,
          targetType: ActivityTargetType.TEAM_POSITION.toString(),
          targetId: updated.id,
        },
      });

      return updated;
    });

    return {
      message: 'Team position updated successfully',
      data: updatedTeamPosition,
    };
  }

  async applyToPosition(
    hackathonId: string,
    teamId: string,
    positionId: string,
    applyToTeamPositionDto: ApplyToTeamPositionDto,
    requesterUser: UserMin,
  ) {
    const { message } = applyToTeamPositionDto;

    // Find the team position with team details
    const teamPosition = await this.prisma.teamPosition.findUnique({
      where: {
        id: positionId,
      },
      include: {
        team: {
          include: {
            hackathon: {
              select: {
                id: true,
                title: true,
              },
            },
            members: {
              select: {
                id: true,
                userId: true,
                isLeader: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teamPosition) {
      throw new NotFoundException('Team position not found');
    }

    // Check if the position is open
    if (teamPosition.status !== TeamPositionStatus.OPEN) {
      throw new BadRequestException('Team position is not open anymore.');
    }

    // Verify the position belongs to the specified team
    if (teamPosition.teamId !== teamId) {
      throw new BadRequestException(
        'Team position does not belong to this team',
      );
    }

    // Verify the team belongs to the specified hackathon
    if (teamPosition.team.hackathonId !== hackathonId) {
      throw new BadRequestException('Team is not associated to the hackathon');
    }

    // Check if the user is registered for the hackathon
    const registration = await this.prisma.hackathonRegistration.findUnique({
      where: {
        hackathonId_userId: { hackathonId, userId: requesterUser.id },
      },
    });

    if (!registration) {
      throw new BadRequestException(
        'You are not registered for this hackathon',
      );
    }

    // Check if the user is already in a team for this hackathon
    const existingTeamMember = await this.prisma.teamMember.findFirst({
      where: {
        userId: requesterUser.id,
        team: {
          hackathonId: hackathonId,
        },
      },
    });

    if (existingTeamMember) {
      throw new ConflictException(
        'You are already in a team for this hackathon',
      );
    }

    // Check if the user has already applied to this position
    const existingApplication = await this.prisma.teamApplication.findFirst({
      where: {
        userId: requesterUser.id,
        positionId,
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied to this position');
    }

    const teamLeader = teamPosition.team.members.find(
      (member) => member.isLeader,
    );

    // apply to the position
    const application = await this.prisma.$transaction(async (tx) => {
      const application = await tx.teamApplication.create({
        data: {
          userId: requesterUser.id,
          positionId,
          message,
        },
      });

      // Store the activity log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'APPLY_TO_TEAM_POSITION',
          isPublic: false,
          description: `Applied to team position ${teamPosition.title} for team ${teamPosition.team.name}`,
          targetType: ActivityTargetType.TEAM_POSITION,
          targetId: teamPosition.id,
        },
      });

      if (teamLeader) {
        // create new notification for the team leader
        await tx.notification.create({
          data: {
            toUserId: teamLeader.id,
            type: 'TEAM_POSITION_APPLICATION',
            content: `New application for team position ${teamPosition.title} for team ${teamPosition.team.name}`,
            payload: {
              hackathonId,
              teamId,
              positionId,
              teamApplicationId: application.id,
            },
          },
        });
      }

      return application;
    });

    // Send email to the team leader notifying them of the new application

    if (teamLeader) {
      const emailHtml = TeamPositionApplicationEmailTemplateHtml(
        teamLeader.user.name,
        requesterUser.name || requesterUser.username,
        teamPosition.title,
        teamPosition.team.name,
        teamPosition.team.hackathon.title,
        hackathonId,
        teamId,
        message,
      );

      try {
        // Send email
        await this.emailService.sendEmail(
          teamLeader.user.email,
          `New Application for ${teamPosition.title} - ${teamPosition.team.name}`,
          emailHtml,
        );
      } catch (error) {
        // Log error but don't fail the application
        this.logger.error(
          'Failed to send team position application email:',
          error,
        );
      }
    }

    return {
      message: 'Application submitted successfully',
      data: application,
    };
  }
}
