import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TeamPositionsService } from './team-positions.service';
import { CreateTeamPositionDto } from './dto/create.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Hackathon Team Positions')
@Controller('hackathon/:hackathonId/teams/:teamId/positions')
export class TeamPositionsController {
  constructor(private readonly teamPositionsService: TeamPositionsService) {}

  @ApiOperation({
    summary: 'Create a team position',
    description: 'Create a team position for your hackathon team',
  })
  @ApiResponse({
    status: 201,
    description: 'Team position created successfully',
    example: {
      message: 'Team position created successfully',
      data: {
        id: 'cmj70dgvx000054fdhc2w7t7x',
        teamId: 'cmj45ptq703fcwofd82wy9k09',
        createdById: 'cmj45pq1i00bcwofdnljyob3o',
        title: 'Backend Developer 2',
        description: 'badfdsffs',
        requiredSkills: ['rust'],
        status: 'OPEN',
        createdAt: '2025-12-15T10:26:06.141Z',
        updatedAt: '2025-12-15T10:26:06.141Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Team is full',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - You are not the leader of this team',
  })
  @ApiNotFoundResponse({
    description: 'Not found - Team not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Body() createTeamPositionDto: CreateTeamPositionDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamPositionsService.create(
      hackathonId,
      teamId,
      createTeamPositionDto,
      user,
    );
  }
}
