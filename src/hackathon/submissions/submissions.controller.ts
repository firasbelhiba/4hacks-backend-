import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';
import { UserMin } from 'src/common/types';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Hackathon Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({
    summary: 'Get a submission by ID',
    description:
      'Retrieves a submission by its ID. Authorization rules: ' +
      '1) Public users can only view SUBMITTED submissions from public hackathons. ' +
      '2) Admins, organization owners, and team members can view all submissions (including UNDER_REVIEW, REJECTED, DRAFT, WITHDRAWN). ' +
      '3) Private hackathon submissions are only visible to admins, organization owners, and team members.',
  })
  @ApiResponse({
    status: 200,
    description: 'Submission retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Submission not found',
  })
  @ApiForbiddenResponse({
    description:
      'Access denied: submission is not approved, hackathon is private, or user lacks permission',
  })
  @ApiBadRequestResponse({
    description: 'Submission does not belong to this hackathon',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':submissionId')
  getById(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: UserMin | null,
  ) {
    return this.submissionsService.getSubmissionById(submissionId, user);
  }
}
