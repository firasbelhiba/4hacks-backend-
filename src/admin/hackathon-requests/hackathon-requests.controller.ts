import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
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
import { RejectRequestDto } from './dto/reject-request.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

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

  @ApiOperation({
    summary: 'Approve a hackathon request',
    description:
      'Approve a pending hackathon request and create the hackathon. This will change the request status to APPROVED and create a new hackathon in DRAFT status. Only PENDING requests can be approved.',
  })
  @ApiParam({
    name: 'id',
    description: 'Hackathon request ID',
    example: 'cm4wd2xyz0000abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Request approved successfully and hackathon created',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon request not found',
  })
  @ApiBadRequestResponse({
    description: 'Request is not in PENDING status',
  })
  @ApiConflictResponse({
    description: 'Hackathon with this slug already exists or request already approved',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiForbiddenResponse({ description: 'Forbidden access' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  @Patch(':id/approve')
  async approve(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return await this.hackathonRequestsService.approveRequest(id, adminId);
  }

  @ApiOperation({
    summary: 'Reject a hackathon request',
    description:
      'Reject a pending hackathon request with a reason. This will change the request status to REJECTED. Only PENDING requests can be rejected.',
  })
  @ApiParam({
    name: 'id',
    description: 'Hackathon request ID',
    example: 'cm4wd2xyz0000abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Request rejected successfully',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon request not found',
  })
  @ApiBadRequestResponse({
    description: 'Request is not in PENDING status or invalid rejection reason',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiForbiddenResponse({ description: 'Forbidden access' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: RejectRequestDto,
  ) {
    return await this.hackathonRequestsService.rejectRequest(
      id,
      adminId,
      dto.reason,
    );
  }
}
