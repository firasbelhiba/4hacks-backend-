import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';
import { CreateTeamDto } from './dto/create.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { TeamMemberDto } from './dto/member.dto';
import { TransferTeamLeadershipDto } from './dto/leadership.dto';
import { FindHackathonTeamsDto } from './dto/find-teams.dto';

@ApiTags('Hackathon Teams')
@Controller('hackathon/:hackathonId/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @ApiOperation({
    summary: 'Get all teams for a hackathon',
    description: `Returns a paginated list of teams for a given hackathon. Supports search by team name or tagline.

**Access Control:**
- **Public hackathons**: Anyone can view teams (no authentication required)
- **Private hackathons**:
  - Admins can always view
  - Organizers can always view
  - Registered users with APPROVED status can view
  - Others cannot access

**Response includes:**
- Team details (id, name, tagline, image, createdAt)
- Member count
- Team members with their basic info (leader listed first)`,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by team name or tagline',
    example: 'awesome team',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of teams with members',
    schema: {
      example: {
        data: [
          {
            id: 'clxx123...',
            name: 'Awesome Team',
            tagline: 'Building the future',
            image: 'https://...',
            createdAt: '2024-01-01T00:00:00.000Z',
            memberCount: 3,
            members: [
              {
                id: 'member123',
                isLeader: true,
                joinedAt: '2024-01-01T00:00:00.000Z',
                user: {
                  id: 'user123',
                  username: 'johndoe',
                  name: 'John Doe',
                  image: 'https://...',
                },
              },
            ],
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasNextPage: true,
          hasPrevPage: false,
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Hackathon not found' })
  @ApiForbiddenResponse({
    description:
      'Access denied. For private hackathons, you must be registered and approved to view teams.',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('')
  async getHackathonTeams(
    @Param('hackathonId') hackathonId: string,
    @Query() query: FindHackathonTeamsDto,
    @CurrentUser() user?: UserMin,
  ) {
    return await this.teamsService.getHackathonTeams(hackathonId, query, user);
  }

  @ApiOperation({
    summary: 'Get Team Details By ID',
    description:
      'Retrieve detailed information about a specific team within a hackathon using the team ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Team details retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Hackathon or Team not found' })
  @ApiBadRequestResponse({ description: 'Invalid hackathon or team ID' })
  @Get(':teamId')
  async getTeamById(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
  ) {
    return await this.teamsService.getTeamById(hackathonId, teamId);
  }

  @ApiOperation({
    summary: 'Create a team',
    description:
      'Create a team for a hackathon. User must be registered for the hackathon and not already in a team. Team name must be unique for the hackathon.',
  })
  @ApiBody({ type: CreateTeamDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('')
  async createTeam(
    @Param('hackathonId') hackathonId: string,
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamsService.createTeam(hackathonId, user, createTeamDto);
  }

  @ApiOperation({
    summary:
      'Add member to a team by its username or email (sends invitation which must be accepted by the user)',
    description:
      'Add a member to a team. User must be registered for the hackathon and not already in a team. An invitation is sent to the user which must be accepted.',
  })
  @ApiResponse({
    status: 201,
    description: 'Team member invitation sent successfully',
  })
  @ApiNotFoundResponse({ description: 'Hackathon, Team, or User not found' })
  @ApiBadRequestResponse({
    description: 'User is not registered for the hackathon',
  })
  @ApiConflictResponse({
    description:
      'Conflict. User is already in a team for this hackathon or an invitation is already pending',
  })
  @ApiBody({ type: TeamMemberDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':teamId/members')
  async addMemberToTeam(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Body() teamMemberDto: TeamMemberDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamsService.addMemberToTeam(
      hackathonId,
      teamId,
      user,
      teamMemberDto,
    );
  }

  @ApiOperation({
    summary: 'Accept a team invitation',
    description:
      'Accept a team invitation. User must be registered for the hackathon and not already in a team.',
  })
  @ApiResponse({
    status: 200,
    description: 'Team invitation accepted successfully',
  })
  @ApiNotFoundResponse({ description: 'Team invitation not found' })
  @ApiBadRequestResponse({
    description: 'User is not registered for the hackathon',
  })
  @ApiConflictResponse({
    description: 'Conflict. User is already in a team for this hackathon',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':teamId/invitations/:invitationId/accept')
  async acceptTeamInvitation(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamsService.acceptTeamInvitation(
      hackathonId,
      teamId,
      invitationId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Decline a team invitation',
    description:
      'Decline a team invitation. User must be registered for the hackathon.',
  })
  @ApiResponse({
    status: 200,
    description: 'Team invitation declined successfully',
  })
  @ApiNotFoundResponse({ description: 'Team invitation not found' })
  @ApiBadRequestResponse({
    description: 'User is not registered for the hackathon',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':teamId/invitations/:invitationId/decline')
  async declineTeamInvitation(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamsService.declineTeamInvitation(
      hackathonId,
      teamId,
      invitationId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Remove a member from a team',
    description: 'Remove a member from a team',
  })
  @ApiResponse({
    status: 200,
    description: 'Team member removed successfully',
  })
  @ApiNotFoundResponse({ description: 'Hackathon, Team, or User not found' })
  @ApiBadRequestResponse({
    description: 'User is not a member of the team',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':teamId/members/:memberId/remove')
  async removeMemberFromTeam(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamsService.removeMemberFromTeam(
      hackathonId,
      teamId,
      memberId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Transfer team leadership',
    description: 'Transfer team leadership to another member',
  })
  @ApiResponse({
    status: 200,
    description: 'Team leadership transferred successfully',
  })
  @ApiNotFoundResponse({ description: 'Hackathon, Team, or User not found' })
  @ApiBadRequestResponse({
    description: 'User is not a member of the team',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':teamId/transfer-leadership')
  async transferTeamLeadership(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Body() newLeaderDto: TransferTeamLeadershipDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamsService.transferTeamLeadership(
      hackathonId,
      teamId,
      newLeaderDto.newLeaderIdentifier,
      user,
    );
  }
}
