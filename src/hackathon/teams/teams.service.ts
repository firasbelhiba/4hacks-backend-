import {
  BadRequestException,
  ConflictException,
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
  HackathonStatus,
  InvitationStatus,
} from 'generated/prisma';
import { TeamMemberDto } from './dto/member.dto';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
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
          },
        },
      });

      return teamInvitation;
    });

    this.logger.log(
      `User ${userToAdd.username} invited to team ${team.name} successfully`,
    );

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

    // Find the invitation
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        team: true,
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
      await tx.teamMember.create({
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

    // Find the invitation
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        team: {
          include: {
            members: {
              select: { userId: true, isLeader: true },
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
      const teamLeaderMember = invitation.team.members.find((m) => m.isLeader);

      if (teamLeaderMember) {
        await tx.notification.create({
          data: {
            toUserId: teamLeaderMember.userId,
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
}
