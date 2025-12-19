import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SubmissionScoresService } from './submission-scores.service';
import { CreateSubmissionScoreDto } from './dto/create.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { type UserMin } from 'src/common/types';
import { UpdateSubmissionScoreDto } from './dto/update.dto';
import { QuerySubmissionScoresDto } from './dto/query.dto';

@ApiTags('Submission Scores')
@Controller('submission-scores')
export class SubmissionScoresController {
  constructor(
    private readonly submissionScoresService: SubmissionScoresService,
  ) {}

  @ApiOperation({
    summary: 'Create a submission score',
    description: 'Judge submit its score for specific submission',
  })
  @ApiResponse({
    status: 201,
    description: 'The submission score has been successfully created',
    example: {
      message: 'Submission score created successfully',
      submissionScore: {
        id: 'cmj17xvls0000s8fd5qdo53od',
        submissionId: 'cmj17s4ra002eo0fd744c2lsr',
        hackathonJudgeId: 'cmj17v08d0000f0fdnjzyrepk',
        score: 6,
        comment: 'The submission is great',
        criteriaScores: {
          innovation: 8,
          feasibility: 7,
          presentation: 9,
        },
        createdAt: '2025-12-11T09:11:18.591Z',
        updatedAt: '2025-12-11T09:11:18.591Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden, you are not a judge in this hackathon',
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createSubmissionScore(
    @Body() createSubmissionScoreDto: CreateSubmissionScoreDto,
    @CurrentUser() judge: UserMin,
  ) {
    return await this.submissionScoresService.createSubmissionScore(
      createSubmissionScoreDto,
      judge,
    );
  }

  @ApiOperation({
    summary: 'Get all submission scores for a hackathon',
    description:
      'Returns paginated list of submissions with their scores. Available to organization owners and judges. Includes which judges have scored each submission and which are missing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated submission scores retrieved successfully',
    example: {
      data: [
        {
          submission: {
            id: 'cmj17s4ra002eo0fd744c2lsr',
            title: 'Blockchain Voting System',
            tagline: 'Secure voting for everyone',
            status: 'SUBMITTED',
            submittedAt: '2025-12-10T14:30:00.000Z',
            team: { id: 'team123', name: 'Team Alpha', image: null },
            track: { id: 'track123', name: 'DeFi' },
            bounties: [],
          },
          scores: [
            {
              id: 'score123',
              score: 8.5,
              comment: 'Great implementation',
              criteriaScores: { innovation: 9, feasibility: 8 },
              createdAt: '2025-12-11T09:00:00.000Z',
              judge: {
                id: 'user123',
                username: 'judge1',
                name: 'John Doe',
                image: null,
              },
            },
          ],
          missingJudges: [
            {
              id: 'hackathonJudge456',
              username: 'judge2',
              name: 'Jane Smith',
              image: null,
            },
          ],
          stats: {
            averageScore: 8.5,
            totalJudges: 2,
            scoredCount: 1,
            missingCount: 1,
          },
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description:
      'Forbidden - you must be the organization owner or a judge to view submission scores',
  })
  @ApiNotFoundResponse({ description: 'Hackathon not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('hackathon/:hackathonId')
  async getHackathonSubmissionScores(
    @Param('hackathonId') hackathonId: string,
    @Query() queryDto: QuerySubmissionScoresDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.submissionScoresService.getHackathonSubmissionScores(
      hackathonId,
      queryDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Update a submission score',
    description: 'Judge update its score for specific submission',
  })
  @ApiResponse({
    status: 200,
    description: 'The submission score has been successfully updated',
    example: {
      message: 'Submission score updated successfully',
      submissionScore: {
        id: 'cmj17xvls0000s8fd5qdo53od',
        submissionId: 'cmj17s4ra002eo0fd744c2lsr',
        hackathonJudgeId: 'cmj17v08d0000f0fdnjzyrepk',
        score: 9,
        comment: 'The submission is great',
        criteriaScores: {
          innovation: 8,
          feasibility: 7,
          presentation: 9,
        },
        createdAt: '2025-12-11T09:11:18.591Z',
        updatedAt: '2025-12-11T09:11:56.223Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden, you are not a judge in this hackathon',
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async updateSubmissionScore(
    @Param('id') submissionScoreId: string,
    @Body() updateSubmissionScoreDto: UpdateSubmissionScoreDto,
    @CurrentUser() judge: UserMin,
  ) {
    return await this.submissionScoresService.updateSubmissionScore(
      submissionScoreId,
      updateSubmissionScoreDto,
      judge,
    );
  }
}
