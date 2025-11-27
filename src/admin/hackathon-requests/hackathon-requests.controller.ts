import { Controller, Get, UseGuards } from '@nestjs/common';
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
    summary: 'Get all hackathon requests',
    description:
      'Get all hackathon requests. This endpoint can be accessed by ADMIN role only',
  })
  @ApiResponse({ status: 200, description: 'List of hackathon requests' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiForbiddenResponse({ description: 'Forbidden access' })
  @ApiBearerAuth()
  @Get()
  async findAll() {
    return await this.hackathonRequestsService.findAll();
  }
}
