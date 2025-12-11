import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
}
