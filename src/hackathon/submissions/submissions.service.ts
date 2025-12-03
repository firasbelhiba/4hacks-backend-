import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HackathonMin, UserMin } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create.dto';
import {
  ActivityTargetType,
  HackathonRequiredMaterials,
  HackathonStatus,
  SubmissionStatus,
} from 'generated/prisma';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(private prismaService: PrismaService) {}

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
      bountyId,
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

    // Check if track and bounty are not both provided
    if (!trackId && !bountyId) {
      throw new BadRequestException(
        'You must provide either a track or a bounty or both',
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

    // Check if bounty exists for hackathon
    if (bountyId) {
      const bounty = await this.prismaService.bounty.findUnique({
        where: { id: bountyId, hackathonId: hackathon.id },
      });

      if (!bounty) {
        throw new NotFoundException('Bounty not found for this hackathon');
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
          bountyId,
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
            : SubmissionStatus.APPROVED,
          submittedAt: new Date(),
          submissionReviewedAt: hackathon.requiresApproval ? null : new Date(),
        },
      });

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'SUBMIT_HACKATHON',
          targetType: ActivityTargetType.HACKATHON,
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

      return newSubmission;
    });

    return {
      message: 'Submission created successfully',
      data: submission,
    };
  }
}
