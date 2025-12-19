import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TeamApplicationStatus } from '@prisma/client';
import {
  TeamPositionApplicationAcceptedEmailTemplateHtml,
  TeamPositionApplicationRejectedEmailTemplateHtml,
} from 'src/common/templates/emails/team.emails';
import { ActivityTargetType, UserMin } from 'src/common/types';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginatedTeamApplicationsDto,
  QueryTeamApplicationsDto,
  SortOrder,
  TeamApplicationSortField,
} from './dto/query-team-applications.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeamApplicationsService {
  private readonly logger = new Logger(TeamApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async findAll(
    query: QueryTeamApplicationsDto,
  ): Promise<PaginatedTeamApplicationsDto> {
    const {
      page = 1,
      limit = 10,
      hackathonId,
      teamId,
      userId,
      teamLeaderId,
      status,
      sortBy,
      sortOrder,
    } = query;

    const where: Prisma.TeamApplicationWhereInput = {
      ...(status && { status }),
      ...(userId && { userId }),
      ...(teamId && { position: { teamId } }),
      ...(hackathonId && { position: { team: { hackathonId } } }),
      ...(teamLeaderId && {
        position: {
          team: {
            members: {
              some: {
                userId: teamLeaderId,
                isLeader: true,
              },
            },
          },
        },
      }),
    };

    // Sorting logic
    let orderBy:
      | Prisma.TeamApplicationOrderByWithRelationInput
      | Prisma.TeamApplicationOrderByWithRelationInput[];

    if (sortBy) {
      orderBy = { [sortBy]: sortOrder || SortOrder.DESC };
    } else {
      // Default sort: Prioritize PENDING, then CreatedAt DESC
      // Enum order in Prisma/Postgres: PENDING, ACCEPTED, REJECTED, WITHDRAWN
      // ASC status means PENDING comes first.
      orderBy = [{ status: 'asc' }, { createdAt: 'desc' }];
    }

    // TODO: Manage access control of what he can see and what not

    const [total, data] = await Promise.all([
      this.prisma.teamApplication.count({ where }),
      this.prisma.teamApplication.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy,
        include: {
          position: {
            select: {
              id: true,
              title: true,
              description: true,
              team: {
                select: {
                  id: true,
                  name: true,
                  hackathonId: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              image: true,
            },
          },
          decidedBy: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      data: data.map((app) => ({
        id: app.id,
        message: app.message,
        status: app.status,
        createdAt: app.createdAt,
        decidedAt: app.decidedAt,
        decidedById: app.decidedById,
        user: app.user,
        position: {
          id: app.position.id,
          title: app.position.title,
          description: app.position.description,
        },
        team: app.position.team,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async acceptApplication(applicationId: string, requesterUser: UserMin) {
    // Find the application with all necessary relations
    const application = await this.prisma.teamApplication.findUnique({
      where: { id: applicationId },
      include: {
        position: {
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
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check if the requester is the team leader
    const isLeader = application.position.team.members.some(
      (member) => member.userId === requesterUser.id && member.isLeader,
    );

    if (!isLeader) {
      throw new ForbiddenException('You are not the leader of this team');
    }

    // Check if application is still pending
    if (application.status !== TeamApplicationStatus.PENDING) {
      throw new BadRequestException(
        `Application has already been ${application.status.toLowerCase()}`,
      );
    }

    // Check if user is already in a team for this hackathon
    const existingTeamMember = await this.prisma.teamMember.findFirst({
      where: {
        userId: application.userId,
        team: {
          hackathonId: application.position.team.hackathonId,
        },
      },
    });

    if (existingTeamMember) {
      throw new ConflictException(
        'User is already in a team for this hackathon',
      );
    }

    // Accept the application and add user to team
    const result = await this.prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.teamApplication.update({
        where: { id: applicationId },
        data: {
          status: TeamApplicationStatus.ACCEPTED,
          decidedAt: new Date(),
          decidedById: requesterUser.id,
        },
      });

      // Add user as team member
      const teamMember = await tx.teamMember.create({
        data: {
          teamId: application.position.teamId,
          userId: application.userId,
          isLeader: false,
        },
      });

      // Create notification for the applicant
      await tx.notification.create({
        data: {
          toUserId: application.userId,
          type: 'TEAM_POSITION_APPLICATION_ACCEPTED',
          content: `Your application for ${application.position.title} in team ${application.position.team.name} has been accepted!`,
          payload: {
            hackathonId: application.position.team.hackathonId,
            teamId: application.position.teamId,
            positionId: application.positionId,
            applicationId,
          },
        },
      });

      // Log activity
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'ACCEPT_TEAM_APPLICATION',
          isPublic: false,
          description: `Accepted application from ${application.user.name || application.user.username} for position ${application.position.title}`,
          targetType: ActivityTargetType.TEAM_POSITION,
          targetId: application.positionId,
        },
      });

      return { updatedApplication, teamMember };
    });

    // Send email to applicant
    try {
      const emailHtml = TeamPositionApplicationAcceptedEmailTemplateHtml(
        application.user.name || application.user.username,
        application.position.title,
        application.position.team.name,
        application.position.team.hackathon.title,
        application.position.team.hackathonId,
        application.position.teamId,
      );

      await this.emailService.sendEmail(
        application.user.email,
        `Application Accepted - ${application.position.team.name}`,
        emailHtml,
      );
    } catch (error) {
      // Log error but don't fail the operation
      this.logger.error('Failed to send application accepted email:', error);
    }

    return {
      message: 'Application accepted successfully',
      data: result.updatedApplication,
    };
  }

  async rejectApplication(applicationId: string, requesterUser: UserMin) {
    // Find the application with all necessary relations
    const application = await this.prisma.teamApplication.findUnique({
      where: { id: applicationId },
      include: {
        position: {
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
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check if the requester is the team leader
    const isLeader = application.position.team.members.some(
      (member) => member.userId === requesterUser.id && member.isLeader,
    );

    if (!isLeader) {
      throw new ForbiddenException('You are not the leader of this team');
    }

    // Check if application is still pending
    if (application.status !== TeamApplicationStatus.PENDING) {
      throw new BadRequestException(
        `Application has already been ${application.status.toLowerCase()}`,
      );
    }

    // Reject the application
    const updatedApplication = await this.prisma.$transaction(async (tx) => {
      // Update application status
      const updated = await tx.teamApplication.update({
        where: { id: applicationId },
        data: {
          status: TeamApplicationStatus.REJECTED,
          decidedAt: new Date(),
          decidedById: requesterUser.id,
        },
      });

      // Create notification for the applicant
      await tx.notification.create({
        data: {
          toUserId: application.userId,
          type: 'TEAM_POSITION_APPLICATION_REJECTED',
          content: `Your application for ${application.position.title} in team ${application.position.team.name} was not accepted`,
          payload: {
            hackathonId: application.position.team.hackathonId,
            teamId: application.position.teamId,
            positionId: application.positionId,
            applicationId,
          },
        },
      });

      // Log activity
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'REJECT_TEAM_APPLICATION',
          isPublic: false,
          description: `Rejected application from ${application.user.name || application.user.username} for position ${application.position.title}`,
          targetType: ActivityTargetType.TEAM_POSITION,
          targetId: application.positionId,
        },
      });

      return updated;
    });

    // Send email to applicant
    try {
      const emailHtml = TeamPositionApplicationRejectedEmailTemplateHtml(
        application.user.name || application.user.username,
        application.position.title,
        application.position.team.name,
        application.position.team.hackathon.title,
        application.position.team.hackathonId,
      );

      await this.emailService.sendEmail(
        application.user.email,
        `Application Update - ${application.position.team.name}`,
        emailHtml,
      );
    } catch (error) {
      this.logger.error('Failed to send application rejected email:', error);
    }

    return {
      message: 'Application rejected successfully',
      data: updatedApplication,
    };
  }
}
