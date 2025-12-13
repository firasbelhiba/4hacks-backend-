import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserMin } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamDto } from './dto/create.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import {
  ActivityTargetType,
  HackathonRegistrationStatus,
  HackathonStatus,
  InvitationStatus,
  UserRole,
} from '@prisma/client';
import { TeamMemberDto } from './dto/member.dto';
import { FindHackathonTeamsDto } from './dto/find-teams.dto';
import { EmailService } from 'src/email/email.service';
import {
  TeamInvitationEmailTemplateHtml,
  TeamInvitationAcceptedEmailTemplateHtml,
  TeamInvitationDeclinedEmailTemplateHtml,
} from 'src/common/templates/emails/team.emails';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
    private readonly emailService: EmailService,
  ) {}

  async createTeam(
    hackathonId: string,
    requesterUser: UserMin,
    createTeamDto: CreateTeamDto,
    imageFile?: Express.Multer.File,
  ) {
    this.logger.log(
      `Creating team for hackathon ${hackathonId} by user ${requesterUser.username}`,
    );

    const { name, tagline } = createTeamDto;

    // Check if hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        organization: {
          select: { name: true, slug: true, ownerId: true },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if the user is registered for the hackathon
    const registration = await this.prisma.hackathonRegistration.findUnique({
      where: {
        hackathonId_userId: { hackathonId, userId: requesterUser.id },
      },
    });

    if (!registration) {
      throw new NotFoundException(
        'You must be registered for the hackathon to create a team',
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

    // Check if team name already exists for this hackathon
    const existingTeam = await this.prisma.team.findUnique({
      where: {
        hackathonId_name: { hackathonId, name },
      },
    });

    if (existingTeam) {
      throw new ConflictException(
        'A team with this name already exists for this hackathon',
      );
    }

    // Upload team image if provided
    let imageUrl: string | undefined;

    if (imageFile) {
      imageUrl = await this.fileUploadService.uploadTeamImage(
        imageFile,
        hackathonId,
        name,
      );
    }

    // Create the team
    const team = await this.prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          tagline,
          image: imageUrl,
          hackathonId,
        },
      });

      // Add the creator as a team member
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: requesterUser.id,
          isLeader: true,
        },
      });

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'CREATE_TEAM',
          targetType: ActivityTargetType.HACKATHON,
          targetId: hackathonId,
          description: `created team ${newTeam.name} for hackathon ${hackathon.slug}`,
        },
      });

      // Get the full team object with members
      const fullTeam = await tx.team.findUnique({
        where: { id: newTeam.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return fullTeam;
    });

    return {
      message: 'Team created successfully',
      data: team,
    };
  }

  async addMemberToTeam(
    hackathonId: string,
    teamId: string,
    requesterUser: UserMin,
    teamMemberDto: TeamMemberDto,
  ) {
    this.logger.log(
      `Adding member to team ${teamId} for hackathon ${hackathonId} by user ${requesterUser.username}`,
    );

    const { member_identifier } = teamMemberDto;

    // Check if hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId, hackathonId: hackathonId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if the team is full (get the max team size from hackathon settings)
    const hackathonMaxTeamSize = hackathon.maxTeamSize;

    if (team.members.length >= hackathonMaxTeamSize) {
      throw new BadRequestException('Team is already full');
    }

    // Check if he is already member of the team
    const isAlreadyMember = team.members.some(
      (m) =>
        m.user.username === member_identifier ||
        m.user.email === member_identifier,
    );

    if (isAlreadyMember) {
      throw new BadRequestException('User is already a member of the team');
    }

    // Check if the requester is the team leader
    const leaderMember = team.members.find(
      (m) => m.userId === requesterUser.id && m.isLeader,
    );

    if (!leaderMember) {
      throw new BadRequestException('You are not the team leader');
    }

    // Find the user to be added by username or email
    const userToAdd = await this.prisma.users.findFirst({
      where: {
        OR: [{ username: member_identifier }, { email: member_identifier }],
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
      },
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    //Check if he already received an invitation that is still pending
    const existingInvitation = await this.prisma.teamInvitation.findFirst({
      where: {
        teamId: team.id,
        invitedUserId: userToAdd.id,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ConflictException(
        'An invitation is already sent to this user and is still pending',
      );
    }

    // Check if the user is registered for the hackathon
    const registration = await this.prisma.hackathonRegistration.findUnique({
      where: {
        hackathonId_userId: { hackathonId, userId: userToAdd.id },
      },
    });

    if (!registration) {
      throw new BadRequestException(
        'The user to be added is not registered for the hackathon',
      );
    }

    // Check if the user is already in a team for this hackathon
    const existingTeamMember = await this.prisma.teamMember.findFirst({
      where: {
        userId: userToAdd.id,
        team: {
          hackathonId: hackathonId,
        },
      },
    });

    if (existingTeamMember) {
      throw new ConflictException(
        'The user to be added is already in a team for this hackathon',
      );
    }

    // Add the user to the team by sending an invitation
    const teamInvitation = await this.prisma.$transaction(async (tx) => {
      const teamInvitation = await tx.teamInvitation.create({
        data: {
          teamId: team.id,
          invitedUserId: userToAdd.id,
          inviterUserId: requesterUser.id,
        },
      });

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'INVITE_TEAM_MEMBER',
          targetId: teamId,
          isPublic: false,
          description: `invited user ${userToAdd.username} to team ${team.name} for hackathon ${hackathon.slug}`,
        },
      });

      // Sent a notification to the invited user
      await tx.notification.create({
        data: {
          toUserId: userToAdd.id,
          fromUserId: requesterUser.id,
          type: 'TEAM_INVITE',
          content: `You have been invited to join team ${team.name} for hackathon ${hackathon.slug} By ${requesterUser.username}`,
          payload: {
            teamId: team.id,
            hackathonId: hackathon.id,
            teamInvitationId: teamInvitation.id,
          },
        },
      });

      return teamInvitation;
    });

    this.logger.log(
      `User ${userToAdd.username} invited to team ${team.name} successfully`,
    );

    // Send email notification to the invited user (non-blocking)
    try {
      await this.emailService.sendEmail(
        userToAdd.email,
        `You've been invited to join team "${team.name}" for ${hackathon.slug}`,
        TeamInvitationEmailTemplateHtml(
          userToAdd.name || userToAdd.username || userToAdd.email,
          requesterUser.name || requesterUser.username || requesterUser.email,
          team.name,
          hackathon.title,
          hackathon.id,
          teamInvitation.id
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to send team invitation email to ${userToAdd.email}: ${error.message}`,
      );
    }

    return {
      message: 'Team member invitation sent successfully',
      data: teamInvitation,
    };
  }

  async acceptTeamInvitation(
    hackathonId: string,
    teamId: string,
    invitationId: string,
    user: UserMin,
  ) {
    this.logger.log(
      `Accepting team invitation ${invitationId} for team ${teamId} and hackathon ${hackathonId} by user ${user.username}`,
    );

    // Find the invitation with team, hackathon, and team leader info
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        team: {
          include: {
            hackathon: {
              select: { title: true, slug: true },
            },
            members: {
              where: { isLeader: true },
              include: {
                user: {
                  select: { id: true, email: true, name: true, username: true },
                },
              },
            },
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Team invitation not found');
    }

    // Verify that the invitation is for the correct team and hackathon
    if (
      invitation.team.id !== teamId ||
      invitation.team.hackathonId !== hackathonId
    ) {
      throw new BadRequestException(
        'Invitation does not match the specified team or hackathon',
      );
    }

    // Verify that the invitation is for the current user
    if (invitation.invitedUserId !== user.id) {
      throw new BadRequestException(
        'You are not authorized to accept this invitation',
      );
    }

    // Check if the invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Invitation is already ${invitation.status} and cannot be accepted`,
      );
    }

    // Not need to check if the user is registered for the hackathon because only registered users can receive invitations

    // Check if the user is already in a team for this hackathon
    const existingTeamMember = await this.prisma.teamMember.findFirst({
      where: {
        userId: user.id,
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

    // Get the team leader for email notification
    const teamLeader = invitation.team.members[0]?.user;

    // Accept the invitation and add the user to the team member and sent notification to the team leader, and store user activity log
    const result = await this.prisma.$transaction(async (tx) => {
      // Update the invitation status to ACCEPTED
      const updatedInvitation = await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          actedAt: new Date(),
        },
      });

      // Add the user to the team members
      const newTeamMmber = await tx.teamMember.create({
        data: {
          teamId: teamId,
          userId: user.id,
        },
      });

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: user.id,
          action: 'ACCEPT_TEAM_INVITATION',
          targetType: ActivityTargetType.HACKATHON,
          targetId: hackathonId,
          description: `accepted team invitation for team ${invitation.team.name} for hackathon ${hackathonId}`,
        },
      });

      // Send a notification to the team leader
      const teamLeaderMember = await tx.teamMember.findFirst({
        where: {
          teamId: teamId,
          isLeader: true,
        },
      });

      if (teamLeaderMember) {
        await tx.notification.create({
          data: {
            toUserId: teamLeaderMember.userId,
            fromUserId: user.id,
            type: 'TEAM_INVITE_ACCEPTED',
            content: `Your invitation to ${user.username} to join team ${invitation.team.name} for hackathon ${hackathonId} has been accepted`,
            payload: {
              memberId: newTeamMmber.id,
              teamInvitationId: invitation.id,
              teamId: teamId,
              hackathonId: hackathonId,
            },
          },
        });
      }

      return updatedInvitation;
    });

    this.logger.log(
      `Team invitation ${invitationId} accepted successfully by user ${user.username}`,
    );

    // Send email notification to the team leader (non-blocking)
    if (teamLeader) {
      try {
        await this.emailService.sendEmail(
          teamLeader.email,
          `${user.name || user.username || user.email} has joined your team "${invitation.team.name}"`,
          TeamInvitationAcceptedEmailTemplateHtml(
            teamLeader.name || teamLeader.username || teamLeader.email,
            user.name || user.username || user.email,
            invitation.team.name,
            invitation.team.hackathon.title,
            invitation.team.hackathonId,
            invitation.team.id,
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to send team invitation accepted email to ${teamLeader.email}: ${error.message}`,
        );
      }
    }

    return {
      message: 'Team invitation accepted successfully',
      data: result,
    };
  }

  async declineTeamInvitation(
    hackathonId: string,
    teamId: string,
    invitationId: string,
    user: UserMin,
  ) {
    this.logger.log(
      `Declining team invitation ${invitationId} for team ${teamId} and hackathon ${hackathonId} by user ${user.username}`,
    );

    // Find the invitation with team, hackathon, and team leader info
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        team: {
          include: {
            hackathon: {
              select: { title: true, slug: true },
            },
            members: {
              where: { isLeader: true },
              include: {
                user: {
                  select: { id: true, email: true, name: true, username: true },
                },
              },
            },
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Team invitation not found');
    }

    // Verify that the invitation is for the correct team and hackathon
    if (
      invitation.team.id !== teamId ||
      invitation.team.hackathonId !== hackathonId
    ) {
      throw new BadRequestException(
        'Invitation does not match the specified team or hackathon',
      );
    }

    // Verify that the invitation is for the current user
    if (invitation.invitedUserId !== user.id) {
      throw new BadRequestException(
        'You are not authorized to accept this invitation',
      );
    }

    // Check if the invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Invitation is already ${invitation.status} and cannot be rejected`,
      );
    }

    // Get the team leader for email notification
    const teamLeader = invitation.team.members[0]?.user;

    // Decline the invitation and sent notification to the team leader, and store user activity log
    const result = await this.prisma.$transaction(async (tx) => {
      // Update the invitation status to DECLINED
      const updatedInvitation = await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.DECLINED,
          actedAt: new Date(),
        },
      });

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: user.id,
          action: 'DECLINE_TEAM_INVITATION',
          targetType: ActivityTargetType.HACKATHON,
          targetId: teamId,
          description: `declined team invitation for team ${invitation.team.name} for hackathon ${hackathonId}`,
        },
      });

      // Send a notification to the team leader
      if (teamLeader) {
        await tx.notification.create({
          data: {
            toUserId: teamLeader.id,
            fromUserId: user.id,
            type: 'TEAM_INVITE_DECLINED',
            content: `Your invitation to ${user.username} to join team ${invitation.team.name} for hackathon ${hackathonId} has been declined`,
            payload: {
              teamId: teamId,
              hackathonId: hackathonId,
            },
          },
        });
      }

      return updatedInvitation;
    });

    this.logger.log(
      `Team invitation ${invitationId} declined successfully by user ${user.username}`,
    );

    // Send email notification to the team leader (non-blocking)
    if (teamLeader) {
      try {
        await this.emailService.sendEmail(
          teamLeader.email,
          `${user.name || user.username || user.email} has declined your team invitation`,
          TeamInvitationDeclinedEmailTemplateHtml(
            teamLeader.name || teamLeader.username || teamLeader.email,
            user.name || user.username || user.email,
            invitation.team.name,
            invitation.team.hackathon.title,
            invitation.team.hackathonId,
            invitation.team.id,
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to send team invitation declined email to ${teamLeader.email}: ${error.message}`,
        );
      }
    }

    return { message: 'Team invitation declined successfully', data: result };
  }

  async removeMemberFromTeam(
    hackathonId: string,
    teamId: string,
    memberId: string,
    requesterUser: UserMin,
  ) {
    this.logger.log(
      `Removing member ${memberId} from team ${teamId} for hackathon ${hackathonId} by user ${requesterUser.username}`,
    );

    // Check if hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { status: true },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (hackathon.status !== HackathonStatus.ACTIVE) {
      throw new BadRequestException('Hackathon is not active');
    }

    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId, hackathonId: hackathonId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if the requester is the team leader
    const leaderMember = team.members.find(
      (m) => m.userId === requesterUser.id && m.isLeader,
    );

    if (!leaderMember) {
      throw new BadRequestException('You are not the team leader');
    }

    // Check if the member to be removed is in the team
    const memberToRemove = team.members.find((m) => m.id === memberId);

    if (!memberToRemove) {
      throw new BadRequestException('User is not a member of the team');
    }

    // Check if the member to be removed is the team leader
    if (memberToRemove.isLeader) {
      throw new BadRequestException(
        'Cannot remove the team leader. Transfer leadership first.',
      );
    }

    // Remove the member from the team
    const deletedMember = await this.prisma.$transaction(async (tx) => {
      const deletedMember = await tx.teamMember.delete({
        where: { id: memberToRemove.id },
      });

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'REMOVE_TEAM_MEMBER',
          targetType: ActivityTargetType.HACKATHON,
          targetId: hackathonId,
          isPublic: false,
          description: `removed user ${memberToRemove.user.username} from team ${team.name} for hackathon ${hackathonId}`,
        },
      });

      // Send a notification to the removed member
      await tx.notification.create({
        data: {
          toUserId: memberToRemove.userId,
          fromUserId: requesterUser.id,
          type: 'TEAM_MEMBER_REMOVED',
          content: `You have been removed from team ${team.name} for hackathon ${hackathonId} by ${requesterUser.username}`,
          payload: {
            teamId: team.id,
            hackathonId: hackathonId,
          },
        },
      });

      return deletedMember;
    });

    this.logger.log(
      `Member ${memberId} removed from team ${teamId} successfully`,
    );

    return {
      message: 'Team member removed successfully',
      data: deletedMember,
    };
  }

  async transferTeamLeadership(
    hackathonId: string,
    teamId: string,
    newLeaderIdentifier: string,
    requesterUser: UserMin,
  ) {
    this.logger.log(
      `Transferring leadership of team ${teamId} for hackathon ${hackathonId} to ${newLeaderIdentifier} by user ${requesterUser.username}`,
    );

    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId, hackathonId: hackathonId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if the requester is the team leader
    const leaderMember = team.members.find(
      (m) => m.userId === requesterUser.id && m.isLeader,
    );

    if (!leaderMember) {
      throw new BadRequestException('You are not the team leader');
    }

    // Find the new leader by username or email
    const newLeader = team.members.find(
      (m) =>
        m.user.username === newLeaderIdentifier ||
        m.user.email === newLeaderIdentifier,
    );

    if (!newLeader) {
      throw new NotFoundException('New leader not found in the team');
    }

    // Check if the new leader is already the team leader
    if (newLeader.isLeader) {
      throw new BadRequestException(
        'The specified user is already the team leader',
      );
    }

    // Transfer leadership
    const updatedTeam = await this.prisma.$transaction(async (tx) => {
      // Update the new leader
      await tx.teamMember.update({
        where: { id: newLeader.id },
        data: {
          isLeader: true,
        },
      });

      // Update the old leader
      await tx.teamMember.update({
        where: { id: leaderMember.id },
        data: {
          isLeader: false,
        },
      });

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'TRANSFER_TEAM_LEADERSHIP',
          // targetType: ActivityTargetType.HACKATHON,
          targetId: teamId,
          description: `transferred leadership of team ${team.name} for hackathon ${hackathonId} to user ${newLeader.user.username}`,
        },
      });

      // Send a notification to the new leader
      await tx.notification.create({
        data: {
          toUserId: newLeader.userId,
          fromUserId: requesterUser.id,
          type: 'TEAM_LEADERSHIP_TRANSFERRED',
          content: `You have been made the leader of team ${team.name} for hackathon ${hackathonId} by ${requesterUser.username}`,
          payload: {
            teamId: team.id,
            hackathonId: hackathonId,
          },
        },
      });

      // Return the updated team with members
      const updatedTeam = await tx.team.findUnique({
        where: { id: team.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return updatedTeam;
    });

    this.logger.log(
      `Leadership of team ${teamId} transferred to ${newLeaderIdentifier} successfully`,
    );

    return {
      message: 'Team leadership transferred successfully',
      data: updatedTeam,
    };
  }

  async getTeamById(hackathonId: string, teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId, hackathonId: hackathonId },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.hackathon.status !== HackathonStatus.ACTIVE) {
      throw new BadRequestException('Hackathon is not active');
    }

    return team;
  }

  async getHackathonTeams(
    hackathonId: string,
    query: FindHackathonTeamsDto,
    user?: UserMin,
  ) {
    const { search } = query;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    // Check if hackathon exists and get access control info
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        isPrivate: true,
        organization: { select: { ownerId: true } },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Determine user access level
    const isAdmin = user && user.role === UserRole.ADMIN;
    const isOrganizer = user && user.id === hackathon.organization.ownerId;
    const hasSpecialAccess = isAdmin || isOrganizer;

    // For private hackathons, check if user is registered
    let isRegistered = false;
    if (hackathon.isPrivate && user && !hasSpecialAccess) {
      const userRegistration =
        await this.prisma.hackathonRegistration.findUnique({
          where: {
            hackathonId_userId: {
              hackathonId,
              userId: user.id,
            },
          },
        });
      isRegistered =
        !!userRegistration &&
        userRegistration.status === HackathonRegistrationStatus.APPROVED;
    }

    // Access control for private hackathons:
    // - Admins can always access
    // - Organizers can always access
    // - Registered users with APPROVED status can access
    // - Others cannot access
    if (hackathon.isPrivate && !hasSpecialAccess && !isRegistered) {
      throw new ForbiddenException(
        'You do not have permission to view teams for this private hackathon. You must be registered and approved to view teams.',
      );
    }

    // Build where clause for search
    const where: any = {
      hackathonId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Query paginated data
    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: [{ isLeader: 'desc' }, { joinedAt: 'asc' }],
          },
          _count: {
            select: { members: true },
          },
        },
      }),
      this.prisma.team.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: teams.map((team) => ({
        id: team.id,
        name: team.name,
        tagline: team.tagline,
        image: team.image,
        createdAt: team.createdAt,
        memberCount: team._count.members,
        members: team.members.map((member) => ({
          id: member.id,
          isLeader: member.isLeader,
          joinedAt: member.joinedAt,
          user: member.user,
        })),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
