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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { HackathonMin, UserMin } from 'src/common/types';
import { CreateSubmissionDto } from './dto/create.dto';
import { UpdateSubmissionDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';
import { HackathonContextGuard } from '../guards/hackathon.guard';
import { Hackathon } from '../decorators/hackathon.decorator';
import { ReviewSubmissionDto } from './dto/review.dto';

@ApiTags('Hackathon Submissions')
@Controller('hackathon/:hackathonId/submissions')
@UseGuards(HackathonContextGuard)
export class HackathonSubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({
    summary: 'Create a new submission for a hackathon',
    description:
      'Creates a new submission associated with the specified hackathon. The submission is linked to the current user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Submission created successfully',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon, team, track, or bounty not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid submission data',
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'ID of the hackathon',
    example: 'hackathon_12345',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Hackathon() hackathon: HackathonMin,
    @Body() createSubmissionDto: CreateSubmissionDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.submissionsService.createSubmission(
      hackathon,
      createSubmissionDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Review a submission for a hackathon',
    description:
      'Reviews a submission associated with the specified hackathon. The review is linked to the current user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Submission reviewed successfully',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon, submission, or user not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid review data',
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'ID of the hackathon',
    example: 'hackathon_12345',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'ID of the submission',
    example: 'submission_12345',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':submissionId/review')
  review(
    @Hackathon() hackathon: HackathonMin,
    @Param('submissionId') submissionId: string,
    @Body() reviewSubmissionDto: ReviewSubmissionDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.submissionsService.reviewSubmission(
      hackathon,
      submissionId,
      user,
      reviewSubmissionDto,
    );
  }

  @ApiOperation({
    summary: 'Update a submission for a hackathon',
    description:
      'Updates an existing submission associated with the specified hackathon. Any team member can update the submission. Updates are only allowed during the active hackathon period and before the deadline.',
  })
  @ApiResponse({
    status: 200,
    description: 'Submission updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon, submission, team, track, or bounty not found',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid update data, hackathon not active, submission period ended, or submission is rejected',
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'ID of the hackathon',
    example: 'hackathon_12345',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'ID of the submission to update',
    example: 'submission_12345',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':submissionId')
  update(
    @Hackathon() hackathon: HackathonMin,
    @Param('submissionId') submissionId: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.submissionsService.updateSubmission(
      hackathon,
      submissionId,
      updateSubmissionDto,
      user,
    );
  }
}
