import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserMin, ActivityTargetType } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubmissionScoreDto } from './dto/create.dto';
import { SubmissionStatus } from '@prisma/client';
import { UpdateSubmissionScoreDto } from './dto/update.dto';
import {
  QuerySubmissionScoresDto,
  SubmissionScoreSortField,
} from './dto/query.dto';

@Injectable()
export class SubmissionScoresService {
  private readonly logger = new Logger(SubmissionScoresService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createSubmissionScore(
    createSubmissionScoreDto: CreateSubmissionScoreDto,
    judge: UserMin,
  ) {
    const { submissionId, score, comment, criteriaScores } =
      createSubmissionScoreDto;

    // Check if submission id is Valid
    const submission = await this.prismaService.submission.findUnique({
      where: {
        id: submissionId,
      },
      include: {
        hackathon: {
          include: {
            organization: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check if submission status is submitted
    if (submission.status !== SubmissionStatus.SUBMITTED) {
      throw new BadRequestException('Submission is not submitted yet');
    }

    // Check if judge has permissions o judge on this submission by its hackathon
    const hackathonJudge = await this.prismaService.hackathonJudge.findUnique({
      where: {
        hackathonId_userId: {
          userId: judge.id,
          hackathonId: submission.hackathonId,
        },
      },
    });

    if (!hackathonJudge) {
      throw new ForbiddenException('You are not a judge in this hackathon');
    }

    // Check if this judge already submitted a score for this submission
    const existingScore = await this.prismaService.submissionScore.findUnique({
      where: {
        submissionId_hackathonJudgeId: {
          submissionId,
          hackathonJudgeId: hackathonJudge.id,
        },
      },
    });

    if (existingScore) {
      throw new ForbiddenException(
        'You have already submitted a score for this submission. Try the update endpoint instead',
      );
    }

    // Check if hackathon judging has ended if judgingEnd is set
    const now = new Date();
    if (
      submission.hackathon.judgingEnd &&
      submission.hackathon.judgingEnd < now
    ) {
      throw new BadRequestException('The hackathon judging has ended');
    }

    //  TODO: add condition to check if the hackathon ended (winners announced)

    // Create submission score
    const submissionScore = await this.prismaService.$transaction(
      async (tx) => {
        const submissionScore = await tx.submissionScore.create({
          data: {
            submissionId,
            hackathonJudgeId: hackathonJudge.id,
            score,
            comment,
            criteriaScores,
          },
        });

        // Add activity log
        await tx.userActivityLog.create({
          data: {
            userId: judge.id,
            action: 'JUDGE_SUBMISSION_SCORE',
            description: `Judge ${judge.id} submitted a score for submission ${submission.id}`,
            targetType: ActivityTargetType.JUDGE_SUBMISSION_SCORE.toString(),
            targetId: submissionScore.id,
            metadata: {
              submissionId: submission.id,
              hackathonJudgeId: hackathonJudge.id,
              submissionScoreId: submissionScore.id,
            },
          },
        });

        // ADD a notif for teh organizer owner of the hackathon
        await tx.notification.create({
          data: {
            toUserId: submission.hackathon.organization.ownerId,
            type: 'JUDGE_SUBMISSION_SCORE',
            content: `Judge ${judge.id} submitted a score for submission ${submission.id}`,
            isRead: false,
          },
        });

        return submissionScore;
      },
    );

    return {
      message: 'Submission score created successfully',
      submissionScore,
    };
  }

  async updateSubmissionScore(
    submissionScoreId: string,
    updateSubmissionScoreDto: UpdateSubmissionScoreDto,
    judge: UserMin,
  ) {
    const { score, comment, criteriaScores } = updateSubmissionScoreDto;

    const submissionScore = await this.prismaService.submissionScore.findUnique(
      {
        where: {
          id: submissionScoreId,
        },
        include: {
          hackathonJudge: {
            include: {
              hackathon: {
                include: {
                  organization: {
                    select: {
                      ownerId: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    );

    if (!submissionScore) {
      throw new NotFoundException('Submission score not found');
    }

    if (submissionScore.hackathonJudge.userId !== judge.id) {
      throw new ForbiddenException(
        'You are not the judge of this submission score',
      );
    }

    // Check if hackathon judging has ended based on judgingEnd date
    const now = new Date();
    if (
      submissionScore.hackathonJudge.hackathon.judgingEnd &&
      submissionScore.hackathonJudge.hackathon.judgingEnd < now
    ) {
      throw new BadRequestException('The hackathon judging has ended');
    }

    //TODO: Check if the hackathon winners have been announced

    // Update submission score, add activity log, add notification to the submission owner
    const updatedSubmissionScore = await this.prismaService.$transaction(
      async (tx) => {
        const updatedSubmissionScore = await tx.submissionScore.update({
          where: {
            id: submissionScoreId,
          },
          data: {
            score,
            comment,
            criteriaScores,
          },
        });

        // Add activity log
        await tx.userActivityLog.create({
          data: {
            userId: judge.id,
            action: 'JUDGE_SUBMISSION_SCORE',
            description: `Judge ${judge.id} updated a score for submission ${submissionScore.submissionId}`,
            targetType: ActivityTargetType.JUDGE_SUBMISSION_SCORE.toString(),
            targetId: submissionScore.id,
            metadata: {
              submissionId: submissionScore.submissionId,
              hackathonJudgeId: submissionScore.hackathonJudgeId,
              submissionScoreId: submissionScore.id,
            },
          },
        });

        // Add notification to the submission owner
        await tx.notification.create({
          data: {
            toUserId:
              submissionScore.hackathonJudge.hackathon.organization.ownerId,
            type: 'JUDGE_SUBMISSION_SCORE',
            content: `Judge ${judge.id} updated its score for submission ${submissionScore.submissionId}`,
            isRead: false,
          },
        });

        return updatedSubmissionScore;
      },
    );

    return {
      message: 'Submission score updated successfully',
      submissionScore: updatedSubmissionScore,
    };
  }

  async getHackathonSubmissionScores(
    hackathonId: string,
    queryDto: QuerySubmissionScoresDto,
    requesterUser: UserMin,
  ) {
    this.logger.log(
      `Getting submission scores for hackathon ${hackathonId} by user ${requesterUser.username}`,
    );

    const {
      page = 1,
      limit = 10,
      trackId,
      bountyId,
      status,
      scored,
      search,
      sortBy = SubmissionScoreSortField.CREATED_AT,
      sortOrder = 'desc',
    } = queryDto;

    // Verify hackathon exists and get organization info
    const hackathon = await this.prismaService.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        organization: {
          select: { ownerId: true },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check authorization: user must be org owner or a judge
    const isOrganizationOwner =
      requesterUser.id === hackathon.organization.ownerId;

    const hackathonJudge = await this.prismaService.hackathonJudge.findUnique({
      where: {
        hackathonId_userId: {
          userId: requesterUser.id,
          hackathonId,
        },
      },
    });

    const isJudge = !!hackathonJudge;

    if (!isOrganizationOwner && !isJudge) {
      throw new ForbiddenException(
        'You must be the organization owner or a judge to view submission scores',
      );
    }

    // Get all judges for this hackathon
    const allJudges = await this.prismaService.hackathonJudge.findMany({
      where: { hackathonId },
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
    });

    this.logger.log(
      `All judges for hackathon ${hackathonId} Length: ${allJudges.length}`,
    );

    // Build where clause for submissions
    const whereConditions: any = {
      hackathonId,
      status: status || SubmissionStatus.SUBMITTED,
    };

    if (trackId) {
      whereConditions.trackId = trackId;
    }

    if (bountyId) {
      whereConditions.bountyId = bountyId;
    }

    if (search) {
      whereConditions.title = { contains: search, mode: 'insensitive' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch submissions with scores
    const [submissions, total] = await Promise.all([
      this.prismaService.submission.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
          sortBy === SubmissionScoreSortField.AVERAGE_SCORE
            ? { createdAt: sortOrder } // We'll sort by average score in memory
            : { [sortBy]: sortOrder },
        include: {
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
          bounty: {
            select: {
              id: true,
              title: true,
            },
          },
          submissionScores: {
            include: {
              hackathonJudge: {
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
              },
            },
          },
        },
      }),
      this.prismaService.submission.count({ where: whereConditions }),
    ]);

    // Transform submissions to include scores, missing judges, and stats
    let transformedData = submissions.map((submission) => {
      const scores = submission.submissionScores.map((score) => ({
        id: score.id,
        score: score.score,
        comment: score.comment,
        criteriaScores: score.criteriaScores,
        createdAt: score.createdAt,
        judge: {
          id: score.hackathonJudge.user.id,
          username: score.hackathonJudge.user.username,
          name: score.hackathonJudge.user.name,
          image: score.hackathonJudge.user.image,
        },
      }));

      // Find judges who haven't scored this submission
      const scoredJudgeIds = new Set(
        submission.submissionScores.map((s) => s.hackathonJudge.id),
      );
      const missingJudges = allJudges
        .filter((judge) => !scoredJudgeIds.has(judge.id))
        .map((judge) => ({
          id: judge.id,
          username: judge.user.username,
          name: judge.user.name,
          image: judge.user.image,
        }));

      // Calculate stats
      const scoredCount = scores.length;
      const totalJudges = allJudges.length;
      const averageScore =
        scoredCount > 0
          ? scores.reduce((sum, s) => sum + s.score, 0) / scoredCount
          : null;

      return {
        submission: {
          id: submission.id,
          title: submission.title,
          tagline: submission.tagline,
          status: submission.status,
          submittedAt: submission.submittedAt,
          team: submission.team,
          track: submission.track,
          bounty: submission.bounty,
        },
        scores,
        missingJudges,
        stats: {
          averageScore:
            averageScore !== null ? Math.round(averageScore * 100) / 100 : null,
          totalJudges,
          scoredCount,
          missingCount: totalJudges - scoredCount,
        },
      };
    });

    // Apply scored filter if provided
    if (scored !== undefined) {
      if (scored) {
        // Only submissions with at least one score
        transformedData = transformedData.filter(
          (item) => item.stats.scoredCount > 0,
        );
      } else {
        // Only submissions missing scores
        transformedData = transformedData.filter(
          (item) => item.stats.missingCount > 0,
        );
      }
    }

    // Sort by average score if requested (done in memory since it's calculated)
    if (sortBy === SubmissionScoreSortField.AVERAGE_SCORE) {
      transformedData.sort((a, b) => {
        const aScore = a.stats.averageScore ?? -1;
        const bScore = b.stats.averageScore ?? -1;
        return sortOrder === 'desc' ? bScore - aScore : aScore - bScore;
      });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data: transformedData,
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
