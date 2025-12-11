import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserMin } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubmissionScoreDto } from './dto/create.dto';
import { ActivityTargetType } from '@prisma/client';
import { UpdateSubmissionScoreDto } from './dto/update.dto';

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
            targetType: ActivityTargetType.JUDGE_SUBMISSION_SCORE,
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
            targetType: ActivityTargetType.JUDGE_SUBMISSION_SCORE,
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
}
