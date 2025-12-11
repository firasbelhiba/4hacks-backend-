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
        submissionId_judgeId: {
          submissionId,
          judgeId: hackathonJudge.id,
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
            judgeId: hackathonJudge.id,
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
              judgeId: judge.id,
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
}
