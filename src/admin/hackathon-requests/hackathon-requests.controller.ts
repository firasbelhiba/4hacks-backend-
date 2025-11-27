import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HackathonRequestsService } from './hackathon-requests.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from 'generated/prisma';
import { QueryHackathonRequestsDto } from './dto/query-hackathon-requests.dto';
import { PaginatedHackathonRequestsDto } from './dto/paginated-hackathon-requests.dto';

@ApiTags('Hackathon Requests')
// Apply the JWT Guard and Roles Guard and check for ADMIN role globally for this controller
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/hackathon-requests')
export class HackathonRequestsController {
  constructor(
    private readonly hackathonRequestsService: HackathonRequestsService,
  ) {}

  @ApiOperation({
    summary: 'Get all hackathon requests with pagination, filtering, and sorting',
    description:
      'Get all hackathon requests with support for pagination, filtering by status/organization/date, searching, and sorting. This endpoint can be accessed by ADMIN role only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of hackathon requests',
    type: PaginatedHackathonRequestsDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiForbiddenResponse({ description: 'Forbidden access' })
  @ApiBearerAuth()
  @Get()
  async findAll(
    @Query() query: QueryHackathonRequestsDto,
  ): Promise<PaginatedHackathonRequestsDto> {
    return await this.hackathonRequestsService.findAll(query);
  }
}
