import {
  Body,
  Controller,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TeamPositionsService } from './team-positions.service';
import { CreateTeamPositionDto } from './dto/create.dto';
import { UpdateTeamPositionDto } from './dto/update.dto';
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

  @ApiOperation({
    summary: 'Update a team position',
    description:
      'Update a team position for your hackathon team. Only team leaders can update positions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Team position updated successfully',
    example: {
      message: 'Team position updated successfully',
      data: {
        id: 'cmj70dgvx000054fdhc2w7t7x',
        teamId: 'cmj45ptq703fcwofd82wy9k09',
        createdById: 'cmj45pq1i00bcwofdnljyob3o',
        title: 'Senior Backend Developer',
        description: 'Looking for an experienced backend developer',
        requiredSkills: ['Node.js', 'TypeScript', 'PostgreSQL'],
        status: 'OPEN',
        createdAt: '2025-12-15T10:26:06.141Z',
        updatedAt: '2025-12-15T11:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Bad request - Team position does not belong to this team or team is not associated to the hackathon',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - You are not the leader of this team',
  })
  @ApiNotFoundResponse({
    description: 'Not found - Team position not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':positionId')
  async update(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Param('positionId') positionId: string,
    @Body() updateTeamPositionDto: UpdateTeamPositionDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamPositionsService.update(
      hackathonId,
      teamId,
      positionId,
      updateTeamPositionDto,
      user,
    );
  }
}
