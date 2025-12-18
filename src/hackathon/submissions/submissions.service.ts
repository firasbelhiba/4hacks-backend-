import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HackathonMin, UserMin, ActivityTargetType } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create.dto';
import { UpdateSubmissionDto } from './dto/update.dto';
import {
  HackathonRegistrationStatus,
  HackathonRequiredMaterials,
  HackathonStatus,
  SubmissionStatus,
  UserRole,
} from '@prisma/client';
import { ReviewSubmissionDto, SubmissionReviewAction } from './dto/review.dto';
import { EmailService } from 'src/email/email.service';
import {
  SubmissionAcceptedEmailTemplateHtml,
  SubmissionRejectedEmailTemplateHtml,
} from 'src/common/templates/emails/submission.emails';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createSubmission(
    hackathon: HackathonMin,
    createSubmissionDto: CreateSubmissionDto,
    requesterUser: UserMin,
  ) {
    this.logger.log(
      `Creating submission for hackathon ${hackathon.id} by user ${requesterUser.username}`,
    );

    const {
      teamId,
      trackId,
      bountyIds,
      title,
      tagline,
      description,
      logo,
      demoUrl,
      videoUrl,
      repoUrl,
      pitchUrl,
      technologies,
    } = createSubmissionDto;

    // Check if hackathon status is active
    if (hackathon.status !== HackathonStatus.ACTIVE) {
      throw new BadRequestException('Hackathon is not active');
    }

    // Check if hackathon submission is open
    const now = new Date();

    // Now should be between start and end dates
    if (now < hackathon.startDate) {
      throw new BadRequestException('Hackathon submission is not open yet');
    }

    if (now > hackathon.endDate) {
      throw new BadRequestException('Hackathon submission is closed');
    }

    // Check if team exists for hackathon
    const team = await this.prismaService.team.findUnique({
      where: { id: teamId, hackathonId: hackathon.id },
      include: {
        members: {
          select: { userId: true, isLeader: true },
        },
      },
    });

    if (!team) {
      throw new ForbiddenException('Team does not belong to this hackathon.');
    }

    // Check if user is a member of the team
    const isTeamMember = team.members.some(
      (m) => m.userId === requesterUser.id,
    );

    if (!isTeamMember) {
      throw new ForbiddenException('You are not a member of the team');
    }

    // Only the team leader can create a submission
    const isTeamLeader = team.members.some(
      (m) => m.userId === requesterUser.id && m.isLeader,
    );

    if (!isTeamLeader) {
      throw new ForbiddenException('You are not the leader of the team');
    }

    // Check if track or at least one bounty is provided
    const hasBounties = bountyIds && bountyIds.length > 0;
    if (!trackId && !hasBounties) {
      throw new BadRequestException(
        'You must provide either a track or at least one bounty (or both)',
      );
    }

    // Check if track exists for hackathon
    if (trackId) {
      const track = await this.prismaService.track.findUnique({
        where: { id: trackId, hackathonId: hackathon.id },
      });

      if (!track) {
        throw new NotFoundException('Track not found for this hackathon');
      }
    }

    // Check if all bounties exist for hackathon
    if (hasBounties) {
      const bounties = await this.prismaService.bounty.findMany({
        where: {
          id: { in: bountyIds },
          hackathonId: hackathon.id,
        },
        select: { id: true },
      });

      const foundBountyIds = new Set(bounties.map((b) => b.id));
      const missingBounties = bountyIds.filter((id) => !foundBountyIds.has(id));

      if (missingBounties.length > 0) {
        throw new NotFoundException(
          `Bounties not found for this hackathon: ${missingBounties.join(', ')}`,
        );
      }
    }

    // Check if submission already exists for team and hackathon
    const existingSubmission = await this.prismaService.submission.findUnique({
      where: { teamId_hackathonId: { teamId, hackathonId: hackathon.id } },
    });

    if (existingSubmission) {
      throw new ConflictException('Submission already exists for this team');
    }

    // Check if submission materials are provided if required by hackathon
    if (hackathon.requiredSubmissionMaterials.length > 0) {
      // Check if videoUrl is provided if required
      if (
        hackathon.requiredSubmissionMaterials.includes(
          HackathonRequiredMaterials.VIDEO_DEMO,
        ) &&
        !videoUrl
      ) {
        throw new BadRequestException('Video URL is required');
      }

      // Check if pitchUrl is provided if required
      if (
        hackathon.requiredSubmissionMaterials.includes(
          HackathonRequiredMaterials.PITCH_DECK,
        ) &&
        !pitchUrl
      ) {
        throw new BadRequestException('Pitch URL is required');
      }

      // Check if repoUrl is provided if required
      if (
        hackathon.requiredSubmissionMaterials.includes(
          HackathonRequiredMaterials.GITHUB_REPOSITORY,
        ) &&
        !repoUrl
      ) {
        throw new BadRequestException('Repository URL is required');
      }

      // // Check if testingInstructions is provided if required
      // if (
      //   hackathon.requiredSubmissionMaterials.includes(
      //     HackathonRequiredMaterials.TESTING_INSTRUCTIONS,
      //   ) &&
      //   !testingInstructions
      // ) {
      //   throw new BadRequestException('Testing instructions are required');
      // }
    }

    // Create submission
    const submission = await this.prismaService.$transaction(async (tx) => {
      const newSubmission = await tx.submission.create({
        data: {
          hackathonId: hackathon.id,
          teamId,
          creatorId: requesterUser.id,
          trackId,
          title,
          tagline,
          description,
          logo,
          demoUrl,
          videoUrl,
          repoUrl,
          pitchUrl,
          technologies,
          status: hackathon.requiresApproval
            ? SubmissionStatus.UNDER_REVIEW
            : SubmissionStatus.SUBMITTED,
          submittedAt: new Date(),
          submissionReviewedAt: hackathon.requiresApproval ? null : new Date(),
        },
      });

      // Create bounty associations if any bounties were provided
      if (hasBounties) {
        await tx.submissionBounty.createMany({
          data: bountyIds.map((bountyId) => ({
            submissionId: newSubmission.id,
            bountyId,
          })),
        });
      }

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'SUBMIT_HACKATHON',
          targetType: ActivityTargetType.HACKATHON.toString(),
          targetId: hackathon.id,
          description: `submitted project ${newSubmission.title} to hackathon ${hackathon.slug}`,
        },
      });

      // Send a notification to the hackathon organizer
      await tx.notification.create({
        data: {
          toUserId: hackathon.organization.ownerId,
          fromUserId: requesterUser.id,
          type: 'NEW_HACKATHON_SUBMISSION',
          content: `New submission for hackathon ${hackathon.title} by team ${team.name} led by ${requesterUser.username}`,
          payload: {
            hackathonId: hackathon.id,
            submissionId: newSubmission.id,
          },
        },
      });

      // Send a notification to the hackathon team members
      await tx.notification.createMany({
        data: team.members.map((m) => ({
          toUserId: m.userId,
          fromUserId: requesterUser.id,
          type: 'NEW_HACKATHON_SUBMISSION',
          content: `New submission for hackathon ${hackathon.title} by team ${team.name} led by ${requesterUser.username}`,
          payload: {
            hackathonId: hackathon.id,
            submissionId: newSubmission.id,
          },
        })),
      });

      // Fetch created submission with bounties (inside transaction for consistency)
      return await tx.submission.findUnique({
        where: { id: newSubmission.id },
        select: {
          id: true,
          hackathonId: true,
          teamId: true,
          creatorId: true,
          trackId: true,
          title: true,
          tagline: true,
          description: true,
          logo: true,
          status: true,
          submittedAt: true,
          submissionReviewedAt: true,
          reviewReason: true,
          submissionReviewedById: true,
          demoUrl: true,
          videoUrl: true,
          repoUrl: true,
          pitchUrl: true,
          technologies: true,
          isWinner: true,
          createdAt: true,
          updatedAt: true,
          submissionBounties: {
            select: {
              bounty: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
    });

    // Transform submissionBounties to bounties array
    const { submissionBounties, ...rest } = submission as any;
    const transformedSubmission = {
      ...rest,
      bounties: submissionBounties?.map((sb: any) => sb.bounty) || [],
    };

    return {
      message: 'Submission created successfully',
      data: transformedSubmission,
    };
  }

  async reviewSubmission(
    hackathon: HackathonMin,
    submissionId: string,
    reviewerUser: UserMin,
    reviewData: ReviewSubmissionDto,
  ) {
    // Check if hackathon requires approval
    if (!hackathon.requiresApproval) {
      throw new BadRequestException('Your hackathon does not require approval');
    }

    // Check if reviewer is the hackathon organizer
    if (reviewerUser.id !== hackathon.organization.ownerId) {
      throw new ForbiddenException('You are not the hackathon organizer');
    }

    // Check if submission exists
    const submission = await this.prismaService.submission.findUnique({
      where: { id: submissionId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check if submission belongs to this hackathon
    if (submission.hackathonId !== hackathon.id) {
      throw new BadRequestException(
        'Submission does not belong to this hackathon',
      );
    }

    if (submission.status !== SubmissionStatus.UNDER_REVIEW) {
      throw new BadRequestException('Submission is not under review');
    }

    const updatedSubmission = await this.prismaService.$transaction(
      async (tx) => {
        const updatedSubmission = await tx.submission.update({
          where: { id: submissionId },
          data: {
            status:
              reviewData.action === SubmissionReviewAction.ACCEPT
                ? SubmissionStatus.SUBMITTED
                : SubmissionStatus.REJECTED,
            submissionReviewedAt: new Date(),
            reviewReason: reviewData.reason,
            submissionReviewedById: reviewerUser.id,
          },
        });

        // Notify the submission creator
        await tx.notification.create({
          data: {
            toUserId: submission.creatorId,
            fromUserId: reviewerUser.id,
            type: 'SUBMISSION_REVIEWED',
            content: `Your submission for hackathon ${hackathon.title} has been reviewed and it is ${reviewData.action === SubmissionReviewAction.ACCEPT ? 'accepted' : 'rejected'}.`,
            payload: {
              hackathonId: hackathon.id,
              submissionId: submissionId,
            },
          },
        });

        // Store the User Activity Log
        await tx.userActivityLog.create({
          data: {
            userId: submission.creatorId,
            action: 'REVIEW_HACKATHON_SUBMISSION',
            targetType: ActivityTargetType.SUBMISSION.toString(),
            targetId: submission.id,
            description: `reviewed submission ${submission.title} for hackathon ${hackathon.slug} for ${reviewData.action === SubmissionReviewAction.ACCEPT ? 'acceptance' : 'rejection'}`,
          },
        });

        return updatedSubmission;
      },
    );

    // Send a notification email to the submission creator
    try {
      const emailSubject =
        reviewData.action === SubmissionReviewAction.ACCEPT
          ? `🎉 Your submission "${submission.title}" has been accepted!`
          : `Submission Review Update: "${submission.title}"`;

      const emailHtml =
        reviewData.action === SubmissionReviewAction.ACCEPT
          ? SubmissionAcceptedEmailTemplateHtml(
              submission.creator.name || submission.creator.username,
              submission.title,
              hackathon.title,
              hackathon.id,
              submission.id,
              reviewData.reason,
            )
          : SubmissionRejectedEmailTemplateHtml(
              submission.creator.name || submission.creator.username,
              submission.title,
              hackathon.title,
              hackathon.id,
              reviewData.reason || 'No specific reason provided.',
            );

      await this.emailService.sendEmail(
        submission.creator.email,
        emailSubject,
        emailHtml,
      );

      this.logger.log(
        `Sent ${reviewData.action === SubmissionReviewAction.ACCEPT ? 'acceptance' : 'rejection'} email to ${submission.creator.email} for submission ${submission.id}`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to send notification email in review submission',
        error,
      );

      // Do not throw error as it is not critical to the main flow
      // TODO: Create a logic to store teh failed sent emails and a backgrund service to retry sending them later (use redis pub/sub, kafka,...)
    }

    return {
      message: 'Submission reviewed successfully',
      data: updatedSubmission,
    };
  }

  async updateSubmission(
    hackathon: HackathonMin,
    submissionId: string,
    updateSubmissionDto: UpdateSubmissionDto,
    requesterUser: UserMin,
  ) {
    this.logger.log(
      `Updating submission ${submissionId} for hackathon ${hackathon.id} by user ${requesterUser.username}`,
    );

    // Check if submission exists
    const submission = await this.prismaService.submission.findUnique({
      where: { id: submissionId },
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

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check if team exists
    if (!submission.team) {
      throw new NotFoundException('Team not found for this submission');
    }

    // Check if submission belongs to this hackathon
    if (submission.hackathonId !== hackathon.id) {
      throw new BadRequestException(
        'Submission does not belong to this hackathon',
      );
    }

    // Check if user is a member of the team
    const isTeamMember = submission.team.members.some(
      (m) => m.userId === requesterUser.id,
    );

    if (!isTeamMember) {
      throw new ForbiddenException(
        'You are not a member of the team that created this submission',
      );
    }

    // Check if hackathon is still active
    if (hackathon.status !== HackathonStatus.ACTIVE) {
      throw new BadRequestException(
        'Cannot update submission - hackathon is not active',
      );
    }

    // Check if hackathon submission period is still open
    const now = new Date();

    if (now > hackathon.endDate) {
      throw new BadRequestException(
        'Cannot update submission - hackathon submission period has ended',
      );
    }

    // Check if submission is rejected (rejected submissions cannot be updated)
    if (submission.status === SubmissionStatus.REJECTED) {
      throw new BadRequestException(
        'Cannot update a rejected submission. Please contact the organizers if you believe this is an error.',
      );
    }

    const { trackId, bountyIds, ...otherUpdates } = updateSubmissionDto;

    // Validate track if provided
    if (trackId !== undefined) {
      if (trackId) {
        const track = await this.prismaService.track.findUnique({
          where: { id: trackId, hackathonId: hackathon.id },
        });

        if (!track) {
          throw new NotFoundException('Track not found for this hackathon');
        }
      }
    }

    // Validate bounties if provided
    if (bountyIds !== undefined && bountyIds.length > 0) {
      const bounties = await this.prismaService.bounty.findMany({
        where: {
          id: { in: bountyIds },
          hackathonId: hackathon.id,
        },
        select: { id: true },
      });

      const foundBountyIds = new Set(bounties.map((b) => b.id));
      const missingBounties = bountyIds.filter((id) => !foundBountyIds.has(id));

      if (missingBounties.length > 0) {
        throw new NotFoundException(
          `Bounties not found for this hackathon: ${missingBounties.join(', ')}`,
        );
      }
    }

    // Get current bounty associations if bountyIds not provided in update
    let currentBountyCount = 0;
    if (bountyIds === undefined) {
      currentBountyCount = await this.prismaService.submissionBounty.count({
        where: { submissionId },
      });
    }

    // Check if at least track or bounties will remain after update
    const finalTrackId = trackId !== undefined ? trackId : submission.trackId;
    const finalHasBounties =
      bountyIds !== undefined ? bountyIds.length > 0 : currentBountyCount > 0;

    if (!finalTrackId && !finalHasBounties) {
      throw new BadRequestException(
        'Submission must have at least a track or a bounty',
      );
    }

    // Validate required materials if updating URLs
    if (hackathon.requiredSubmissionMaterials.length > 0) {
      const finalVideoUrl =
        updateSubmissionDto.videoUrl !== undefined
          ? updateSubmissionDto.videoUrl
          : submission.videoUrl;
      const finalPitchUrl =
        updateSubmissionDto.pitchUrl !== undefined
          ? updateSubmissionDto.pitchUrl
          : submission.pitchUrl;
      const finalRepoUrl =
        updateSubmissionDto.repoUrl !== undefined
          ? updateSubmissionDto.repoUrl
          : submission.repoUrl;

      if (
        hackathon.requiredSubmissionMaterials.includes(
          HackathonRequiredMaterials.VIDEO_DEMO,
        ) &&
        !finalVideoUrl
      ) {
        throw new BadRequestException(
          'Video URL is required for this hackathon',
        );
      }

      if (
        hackathon.requiredSubmissionMaterials.includes(
          HackathonRequiredMaterials.PITCH_DECK,
        ) &&
        !finalPitchUrl
      ) {
        throw new BadRequestException(
          'Pitch URL is required for this hackathon',
        );
      }

      if (
        hackathon.requiredSubmissionMaterials.includes(
          HackathonRequiredMaterials.GITHUB_REPOSITORY,
        ) &&
        !finalRepoUrl
      ) {
        throw new BadRequestException(
          'Repository URL is required for this hackathon',
        );
      }
    }

    // Build update data object with only provided fields
    const updateData: any = {};

    if (trackId !== undefined) updateData.trackId = trackId;
    if (otherUpdates.title !== undefined) updateData.title = otherUpdates.title;
    if (otherUpdates.tagline !== undefined)
      updateData.tagline = otherUpdates.tagline;
    if (otherUpdates.description !== undefined)
      updateData.description = otherUpdates.description;
    if (otherUpdates.logo !== undefined) updateData.logo = otherUpdates.logo;
    if (otherUpdates.demoUrl !== undefined)
      updateData.demoUrl = otherUpdates.demoUrl;
    if (otherUpdates.videoUrl !== undefined)
      updateData.videoUrl = otherUpdates.videoUrl;
    if (otherUpdates.repoUrl !== undefined)
      updateData.repoUrl = otherUpdates.repoUrl;
    if (otherUpdates.pitchUrl !== undefined)
      updateData.pitchUrl = otherUpdates.pitchUrl;
    if (otherUpdates.technologies !== undefined)
      updateData.technologies = otherUpdates.technologies;

    // Update submission and fetch with bounties in one go
    const updatedSubmission = await this.prismaService.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: submissionId },
        data: updateData,
      });

      // Update bounty associations if bountyIds is provided
      if (bountyIds !== undefined) {
        // Delete existing bounty associations
        await tx.submissionBounty.deleteMany({
          where: { submissionId },
        });

        // Create new bounty associations
        if (bountyIds.length > 0) {
          await tx.submissionBounty.createMany({
            data: bountyIds.map((bountyId) => ({
              submissionId,
              bountyId,
            })),
          });
        }
      }

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'UPDATE_HACKATHON_SUBMISSION',
          targetType: ActivityTargetType.SUBMISSION.toString(),
          targetId: submission.id,
          description: `updated submission ${submission.title} for hackathon ${hackathon.slug}`,
        },
      });

      // Fetch updated submission with bounties (inside transaction for consistency)
      return await tx.submission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          hackathonId: true,
          teamId: true,
          creatorId: true,
          trackId: true,
          title: true,
          tagline: true,
          description: true,
          logo: true,
          status: true,
          submittedAt: true,
          submissionReviewedAt: true,
          reviewReason: true,
          submissionReviewedById: true,
          demoUrl: true,
          videoUrl: true,
          repoUrl: true,
          pitchUrl: true,
          technologies: true,
          isWinner: true,
          createdAt: true,
          updatedAt: true,
          submissionBounties: {
            select: {
              bounty: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
    });

    // Transform submissionBounties to bounties array
    const { submissionBounties, ...rest } = updatedSubmission as any;
    const transformedSubmission = {
      ...rest,
      bounties: submissionBounties?.map((sb: any) => sb.bounty) || [],
    };

    return {
      message: 'Submission updated successfully',
      data: transformedSubmission,
    };
  }

  async getSubmissionById(submissionId: string, requesterUser: UserMin | null) {
    this.logger.log(
      `Getting submission ${submissionId} by user ${requesterUser?.username || 'anonymous'}`,
    );

    // Fetch submission with team members
    const submission = await this.prismaService.submission.findUnique({
      where: { id: submissionId },
      include: {
        team: {
          include: {
            members: {
              select: {
                userId: true,
                isLeader: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        hackathon: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            status: true,
            requiredSubmissionMaterials: true,
            isPrivate: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                ownerId: true,
              },
            },
          },
        },
        track: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        submissionBounties: {
          select: {
            bounty: {
              select: {
                id: true,
                title: true,
                description: true,
                rewardAmount: true,
                rewardToken: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Authorization logic
    const isAdmin = requesterUser?.role === 'ADMIN';
    const isOrganizationOwner =
      requesterUser?.id === submission.hackathon.organization.ownerId;
    const isTeamMember =
      requesterUser &&
      submission.team?.members.some((m) => m.userId === requesterUser.id);

    // Check if user has special access (admin, org owner, or team member)
    const hasSpecialAccess = isAdmin || isOrganizationOwner || isTeamMember;

    // If hackathon is private and user doesn't have special access, deny access
    if (submission.hackathon.isPrivate && !hasSpecialAccess) {
      throw new ForbiddenException(
        'This hackathon is private. You do not have permission to view submissions.',
      );
    }

    // If submission is not approved (UNDER_REVIEW, REJECTED, DRAFT, WITHDRAWN)
    // only allow access to admins, org owners, and team members
    if (submission.status !== SubmissionStatus.SUBMITTED && !hasSpecialAccess) {
      throw new ForbiddenException(
        'You do not have permission to view this submission',
      );
    }

    // Transform submissionBounties to bounties array for response
    const { submissionBounties, ...rest } = submission as any;
    const transformedSubmission = {
      ...rest,
      bounties: submissionBounties?.map((sb: any) => sb.bounty) || [],
    };

    return {
      message: 'Submission retrieved successfully',
      data: transformedSubmission,
    };
  }

  async getAllSubmissions(
    queryDto: any,
    requesterUser: UserMin | null,
  ): Promise<any> {
    this.logger.log(
      `Getting all submissions by user ${requesterUser?.username || 'anonymous'}`,
    );

    const {
      page = 1,
      limit = 10,
      hackathonId,
      trackId,
      bountyId,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Build the where clause based on authorization
    const whereConditions: any = {
      AND: [],
    };

    // Check if user is admin
    const isAdmin = requesterUser?.role === UserRole.ADMIN;

    if (!isAdmin) {
      // For non-admin users, we need to apply complex authorization logic
      const orConditions: any[] = [];

      if (!requesterUser) {
        // Anonymous users: only SUBMITTED submissions from public hackathons
        orConditions.push({
          status: SubmissionStatus.SUBMITTED,
          hackathon: {
            isPrivate: false,
          },
        });
      } else {
        // Authenticated users
        const userId = requesterUser.id;

        // Get user's registered hackathons
        const userRegistrations =
          await this.prismaService.hackathonRegistration.findMany({
            where: {
              userId,
              status: HackathonRegistrationStatus.APPROVED,
            },
            select: { hackathonId: true },
          });

        const registeredHackathonIds = userRegistrations.map(
          (r) => r.hackathonId,
        );

        // Get hackathons where user is a judge
        const judgeHackathons =
          await this.prismaService.hackathonJudge.findMany({
            where: { userId },
            select: { hackathonId: true },
          });

        const judgeHackathonIds = judgeHackathons.map((j) => j.hackathonId);

        // Get hackathons where user is the organization owner
        const ownedOrganizations =
          await this.prismaService.organization.findMany({
            where: { ownerId: userId },
            select: { id: true },
          });

        const ownedOrgIds = ownedOrganizations.map((o) => o.id);

        // Get teams where user is a member
        const userTeams = await this.prismaService.teamMember.findMany({
          where: { userId },
          select: { teamId: true },
        });

        const userTeamIds = userTeams.map((t) => t.teamId);

        // Condition 1: SUBMITTED submissions from public hackathons
        orConditions.push({
          status: SubmissionStatus.SUBMITTED,
          hackathon: {
            isPrivate: false,
          },
        });

        // Condition 2: SUBMITTED submissions from private hackathons where user is registered
        if (registeredHackathonIds.length > 0) {
          orConditions.push({
            status: SubmissionStatus.SUBMITTED,
            hackathon: {
              isPrivate: true,
              id: { in: registeredHackathonIds },
            },
          });
        }

        // Condition 3: ALL submissions from private hackathons where user is a judge
        if (judgeHackathonIds.length > 0) {
          orConditions.push({
            hackathon: {
              isPrivate: true,
              id: { in: judgeHackathonIds },
            },
          });
        }

        // Condition 4: ALL submissions from hackathons where user is the organization owner
        if (ownedOrgIds.length > 0) {
          orConditions.push({
            hackathon: {
              organizationId: { in: ownedOrgIds },
            },
          });
        }

        // Condition 5: ALL submissions where user is a team member
        if (userTeamIds.length > 0) {
          orConditions.push({
            teamId: { in: userTeamIds },
          });
        }
      }

      // Add OR conditions to the main where clause
      if (orConditions.length > 0) {
        whereConditions.AND.push({ OR: orConditions });
      } else {
        // If no conditions match, return empty result
        return {
          data: [],
          meta: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
    }

    // Apply filters
    if (hackathonId) {
      whereConditions.AND.push({ hackathonId });
    }

    if (trackId) {
      whereConditions.AND.push({ trackId });
    }

    if (bountyId) {
      whereConditions.AND.push({
        submissionBounties: {
          some: { bountyId },
        },
      });
    }

    if (status) {
      // Only allow status filtering for admins or if user has special access
      // For now, we'll add it to the where clause and let the authorization logic handle it
      whereConditions.AND.push({ status });
    }

    if (search) {
      whereConditions.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { tagline: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Clean up empty AND array
    if (whereConditions.AND.length === 0) {
      delete whereConditions.AND;
    }

    // Build order by clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute query
    const [submissions, total] = await Promise.all([
      this.prismaService.submission.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy,
        include: {
          hackathon: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPrivate: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          track: {
            select: {
              id: true,
              name: true,
            },
          },
          submissionBounties: {
            select: {
              bounty: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      this.prismaService.submission.count({ where: whereConditions }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Transform submissionBounties to bounties array for response
    const transformedSubmissions = submissions.map((submission: any) => {
      const { submissionBounties, ...rest } = submission;
      return {
        ...rest,
        bounties: submissionBounties?.map((sb: any) => sb.bounty) || [],
      };
    });

    return {
      data: transformedSubmissions,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
}
