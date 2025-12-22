import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
import {
  PaginatedSubmissionsDto,
  QuerySubmissionsDto,
} from './dto/query-submissions.dto';

@ApiTags('Hackathon Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({
    summary: 'Get all submissions with pagination, filtering, and sorting',
    description:
      '**Authorization Rules:**\n\n' +
      '**1. No Access Token (Anonymous Users):**\n' +
      '- Only returns submissions with status `SUBMITTED` (review accepted)\n' +
      '- Only from public hackathons (`isPrivate = false`)\n' +
      '- Only from hackathons with public submissions (`areSubmissionsPublic = true`)\n\n' +
      '**2. With Access Token (Authenticated Users):**\n' +
      '- Returns submissions with status `SUBMITTED` from public hackathons with public submissions\n' +
      '- **Additionally** returns submissions from private hackathons if:\n' +
      '  - User is registered to the private hackathon (status APPROVED) AND submissions are public, OR\n' +
      '  - User is a judge of the hackathon (can see ALL submissions regardless of visibility setting)\n' +
      '- **Additionally** returns ALL submissions (any status, any visibility) if:\n' +
      '  - User is an ADMIN, OR\n' +
      '  - User is the organization owner of the hackathon, OR\n' +
      '  - User is a team member of the submission\n\n' +
      '**3. Submission Visibility (`areSubmissionsPublic`):**\n' +
      '- When `false`: Only organizers, judges, and team members can view submissions\n' +
      '- When `true`: Normal visibility rules apply (public/registered users can see)\n' +
      '- This setting can be toggled by organizers at any time\n\n' +
      '**4. Filtering:**\n' +
      '- Filter by hackathon ID, track ID, bounty ID\n' +
      '- Filter by status (only effective for admins, org owners, and team members)\n' +
      '- Search in title, tagline, or description\n\n' +
      '**5. Sorting:**\n' +
      '- Sort by: createdAt, submittedAt, title\n' +
      '- Order: asc or desc\n\n' +
      '**6. Pagination:**\n' +
      '- Page number (1-indexed) and limit (max 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Submissions retrieved successfully',
    type: PaginatedSubmissionsDto,
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  getAllSubmissions(
    @Query() queryDto: QuerySubmissionsDto,
    @CurrentUser() user: UserMin | null,
  ) {
    return this.submissionsService.getAllSubmissions(queryDto, user);
  }

  @ApiOperation({
    summary: 'Get a submission by ID',
    description:
      'Retrieves a submission by its ID.\n\n' +
      '**Authorization rules:**\n' +
      '1) Public users can only view SUBMITTED submissions from public hackathons with public submissions (`areSubmissionsPublic = true`).\n' +
      '2) Admins, organization owners, judges, and team members can view all submissions (including UNDER_REVIEW, REJECTED, DRAFT, WITHDRAWN) regardless of visibility settings.\n' +
      '3) Private hackathon submissions are only visible to admins, organization owners, judges, and team members.\n' +
      '4) When `areSubmissionsPublic = false`, only organizers, judges, and the submitting team can view submissions.',
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
