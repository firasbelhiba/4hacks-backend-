import { Controller, Post, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeamApplicationsService } from './team-applications.service';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import {
  PaginatedTeamApplicationsDto,
  QueryTeamApplicationsDto,
} from './dto/query-team-applications.dto';

@ApiTags('Hackathon Team Applications')
@Controller('team-applications')
export class TeamApplicationsController {
  constructor(
    private readonly teamApplicationsService: TeamApplicationsService,
  ) {}

  @ApiOperation({
    summary: 'Get all team applications',
    description:
      'Retrieve a paginated list of team applications with filtering and sorting options. By default, pending applications are prioritized.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of team applications',
    type: PaginatedTeamApplicationsDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: QueryTeamApplicationsDto) {
    return await this.teamApplicationsService.findAll(query);
  }

  @ApiOperation({
    summary: 'Accept a team position application',
    description:
      'Accept an application for a team position. Only team leaders can accept applications. ' +
      'When accepted, the applicant becomes a team member and receives an email notification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application accepted successfully',
    schema: {
      example: {
        message: 'Application accepted successfully',
        data: {
          id: 'cmj70dgvx000054fdhc2w7t7x',
          positionId: 'cmj45ptq703fcwofd82wy9k09',
          userId: 'cmj45pq1i00bcwofdnljyob3o',
          message: 'I am a great developer and I want to join the team',
          status: 'ACCEPTED',
          decidedAt: '2025-12-15T12:00:00.000Z',
          decidedById: 'cmj45pq1i00bcwofdnljyob4p',
          createdAt: '2025-12-15T10:26:06.141Z',
          updatedAt: '2025-12-15T12:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Bad request - Application does not belong to this position, position does not belong to team, or application already processed',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - You are not the leader of this team',
  })
  @ApiNotFoundResponse({
    description: 'Not found - Application not found',
  })
  @ApiConflictResponse({
    description: 'Conflict - User is already in a team for this hackathon',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':applicationId/accept')
  async acceptApplication(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamApplicationsService.acceptApplication(
      applicationId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Reject a team position application',
    description:
      'Reject an application for a team position. Only team leaders can reject applications. ' +
      'The applicant will receive an email notification about the rejection.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application rejected successfully',
    schema: {
      example: {
        message: 'Application rejected successfully',
        data: {
          id: 'cmj70dgvx000054fdhc2w7t7x',
          positionId: 'cmj45ptq703fcwofd82wy9k09',
          userId: 'cmj45pq1i00bcwofdnljyob3o',
          message: 'I am a great developer and I want to join the team',
          status: 'REJECTED',
          decidedAt: '2025-12-15T12:00:00.000Z',
          decidedById: 'cmj45pq1i00bcwofdnljyob4p',
          createdAt: '2025-12-15T10:26:06.141Z',
          updatedAt: '2025-12-15T12:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Bad request - Application does not belong to this position, position does not belong to team, or application already processed',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - You are not the leader of this team',
  })
  @ApiNotFoundResponse({
    description: 'Not found - Application not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':applicationId/reject')
  async rejectApplication(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamApplicationsService.rejectApplication(
      applicationId,
      user,
    );
  }
}
