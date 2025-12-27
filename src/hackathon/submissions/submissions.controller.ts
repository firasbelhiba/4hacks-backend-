import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
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
    summary: "Get user's bookmarked submissions",
    description:
      "Retrieves all submissions bookmarked by the authenticated user with pagination. Returns submissions the user has bookmarked, including full submission details.",
  })
  @ApiResponse({
    status: 200,
    description: 'Bookmarked submissions retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'clx1234567890',
            title: 'Awesome Project',
            tagline: 'A cool hackathon submission',
            description: 'Full project description...',
            status: 'SUBMITTED',
            hackathon: {
              id: 'hack_123',
              title: 'Web3 Hackathon 2025',
              slug: 'web3-hackathon-2025',
            },
            bookmarkedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('bookmarks')
  getBookmarkedSubmissions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser('id') userId: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    return this.submissionsService.getUserBookmarkedSubmissions(
      userId,
      pageNum,
      limitNum,
    );
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

  @ApiOperation({
    summary: 'Bookmark a submission',
    description:
      'Bookmarks a submission for the authenticated user. Users can only bookmark submissions they have permission to view. The user must be able to see the submission based on hackathon visibility settings, private hackathon registration, and submission status. Users cannot bookmark their own submissions (either as creator or team member).',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'ID of the submission to bookmark',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 201,
    description: 'Submission bookmarked successfully',
    schema: {
      example: {
        message: 'Submission bookmarked successfully',
        bookmarked: true,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Submission not found',
  })
  @ApiBadRequestResponse({
    description: 'User cannot bookmark their own submission',
  })
  @ApiForbiddenResponse({
    description:
      'User does not have permission to bookmark this submission (e.g., submission is private, user not registered to private hackathon, etc.)',
  })
  @ApiConflictResponse({
    description: 'Submission is already bookmarked',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':submissionId/bookmark')
  bookmarkSubmission(
    @Param('submissionId') submissionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.submissionsService.bookmarkSubmission(submissionId, userId);
  }

  @ApiOperation({
    summary: 'Unbookmark a submission',
    description:
      'Removes a bookmark from a submission for the authenticated user.',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'ID of the submission to unbookmark',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Submission unbookmarked successfully',
    schema: {
      example: {
        message: 'Submission unbookmarked successfully',
        bookmarked: false,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Bookmark not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':submissionId/bookmark')
  unbookmarkSubmission(
    @Param('submissionId') submissionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.submissionsService.unbookmarkSubmission(submissionId, userId);
  }

}
