import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateTeamDto } from './dto/create.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { TeamMemberDto } from './dto/member.dto';

@ApiTags('Hackathon Teams')
@Controller('hackathon/:hackathonId/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

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
}
