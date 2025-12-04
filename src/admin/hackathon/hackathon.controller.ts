import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AdminHackathonService } from './hackathon.service';
import { CancelHackathonDto } from './dto/cancel-hackathon.dto';

@ApiTags('Admin - Hackathon Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/hackathon')
export class AdminHackathonController {
  constructor(private readonly adminHackathonService: AdminHackathonService) {}

  @ApiOperation({
    summary: 'Cancel a hackathon (Admin only)',
    description: `
Cancel a hackathon by changing its status to CANCELLED.
Only hackathons in **DRAFT** or **ACTIVE** status can be cancelled.

**Access:** Platform administrators only.

**Restrictions:**
- Cannot cancel already cancelled hackathons
- Cannot cancel archived hackathons (they are already completed)

**Side effects:**
- Sends email notification to the organization owner explaining the cancellation
    `,
  })
  @ApiParam({
    name: 'identifier',
    description: 'Hackathon ID or slug',
    required: true,
    type: String,
    example: 'web3-innovation-hackathon',
  })
  @ApiBody({
    type: CancelHackathonDto,
    description: 'Cancellation details including the reason',
  })
  @ApiResponse({
    status: 200,
    description: 'Hackathon cancelled successfully',
    schema: {
      example: {
        message: 'Hackathon cancelled successfully',
        data: {
          id: 'clxyz123',
          title: 'Web3 Innovation Hackathon',
          slug: 'web3-innovation-hackathon',
          status: 'CANCELLED',
          organizationId: 'clxyz456',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Hackathon not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Cannot cancel hackathon due to its current status',
    schema: {
      example: {
        statusCode: 400,
        message: 'Hackathon is already cancelled',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User does not have admin role',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @Post(':identifier/cancel')
  async cancelHackathon(
    @Param('identifier') identifier: string,
    @CurrentUser('id') adminId: string,
    @Body() cancelDto: CancelHackathonDto,
  ) {
    return await this.adminHackathonService.cancelHackathon(
      identifier,
      adminId,
      cancelDto,
    );
  }
}
