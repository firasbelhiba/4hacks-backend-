import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
