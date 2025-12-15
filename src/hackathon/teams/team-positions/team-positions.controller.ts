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
  ApiConflictResponse,
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
import { ApplyToTeamPositionDto } from './dto/apply.dto';

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

  @ApiOperation({
    summary: 'Apply to a team position',
    description: 'Apply to a team position',
  })
  @ApiResponse({
    status: 200,
    description: 'Team position applied successfully',
    example: {
      message: 'Team position applied successfully',
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
  @ApiConflictResponse({
    description: 'Conflict',
    example: {
      message: 'You have already applied to this position',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':positionId/apply')
  async applyToPosition(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Param('positionId') positionId: string,
    @Body() applyToTeamPositionDto: ApplyToTeamPositionDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamPositionsService.applyToPosition(
      hackathonId,
      teamId,
      positionId,
      applyToTeamPositionDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Get all applications for a team position',
    description:
      'Retrieve all applications for a specific team position. Only team members can view applications. ' +
      'Applications are ordered by status (PENDING first) and then by creation date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'cmj70dgvx000054fdhc2w7t7x',
            positionId: 'cmj45ptq703fcwofd82wy9k09',
            userId: 'cmj45pq1i00bcwofdnljyob3o',
            message: 'I am a great developer and I want to join the team',
            status: 'PENDING',
            decidedAt: null,
            decidedById: null,
            createdAt: '2025-12-15T10:26:06.141Z',
            updatedAt: '2025-12-15T10:26:06.141Z',
            user: {
              id: 'cmj45pq1i00bcwofdnljyob3o',
              name: 'John Doe',
              username: 'johndoe',
              email: 'john@example.com',
              image: 'https://example.com/john.png',
            },
            decidedBy: null,
          },
          {
            id: 'cmj70dgvx000054fdhc2w7t8y',
            positionId: 'cmj45ptq703fcwofd82wy9k09',
            userId: 'cmj45pq1i00bcwofdnljyob4p',
            message: 'I have 5 years of experience in backend development',
            status: 'ACCEPTED',
            decidedAt: '2025-12-15T12:00:00.000Z',
            decidedById: 'cmj45pq1i00bcwofdnljyob5q',
            createdAt: '2025-12-15T09:00:00.000Z',
            updatedAt: '2025-12-15T12:00:00.000Z',
            user: {
              id: 'cmj45pq1i00bcwofdnljyob4p',
              name: 'Jane Smith',
              username: 'janesmith',
              email: 'jane@example.com',
              image: 'https://example.com/jane.png',
            },
            decidedBy: {
              id: 'cmj45pq1i00bcwofdnljyob5q',
              name: 'Team Leader',
              username: 'teamleader',
            },
          },
        ],
        total: 2,
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Bad request - Team position does not belong to this team or team is not associated to the hackathon',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - You are not a member of this team',
  })
  @ApiNotFoundResponse({
    description: 'Not found - Team position not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':positionId/applications')
  async getPositionApplications(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Param('positionId') positionId: string,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamPositionsService.getPositionApplications(
      hackathonId,
      teamId,
      positionId,
      user,
    );
  }
}
