import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HackathonRequestService } from './hackathon-request.service';
import { CreateHackathonRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { FindByOrganizationDto } from './dto/find.dto';

@ApiTags('Hackathon Requests')
@Controller('hackathon-requests')
export class HackathonRequestController {
  constructor(private readonly requestService: HackathonRequestService) {}

  @ApiOperation({ summary: 'Get all hackathon requests for an organization' })
  @ApiResponse({
    status: 200,
    description: 'Return all hackathon requests for the organization',
  })
  @ApiNotFoundResponse({
    description: 'Organization not found or you are not authorized to view it',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findByOrganization(
    @Query() query: FindByOrganizationDto,
    @CurrentUser() user: UserMin,
  ) {
    const identifier = query.org;
    return this.requestService.findByOrganization(identifier, user);
  }

  @ApiOperation({ summary: 'Create a hackathon creation request' })
  @ApiBody({ type: CreateHackathonRequestDto })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User is not the owner of the organization',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiConflictResponse({
    description: 'Hackathon with this slug already exists',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @CurrentUser() user: UserMin,
    @Body() createRequestDto: CreateHackathonRequestDto,
  ) {
    return this.requestService.create(user.id, createRequestDto);
  }

  @ApiOperation({ summary: 'Get hackathon request details' })
  @ApiParam({
    name: 'identifier',
    description: 'Request identifier (id or hackathon slug)',
    example: 'hedera-africa-hackathon-2025',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the hackathon request details',
  })
  @ApiNotFoundResponse({
    description:
      'Hackathon request not found or you are not authorized to view it',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':identifier')
  findOne(
    @Param('identifier') identifier: string,
    @CurrentUser() user: UserMin,
  ) {
    return this.requestService.findOne(identifier, user);
  }

  @ApiOperation({
    summary: 'Delete a hackathon request (Owner only)',
    description: `
Delete (soft delete) a hackathon creation request by changing its status to DELETED.
Only the organization owner can delete their own PENDING requests.

**Restrictions:**
- Only **PENDING** requests can be deleted
- Only the **organization owner** can delete (not admins)
- Request is not removed from database, just marked as DELETED

**Effects:**
- Status changes to DELETED
- Request is hidden from owner's view
- Admins can still see it for audit purposes
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Hackathon request ID',
    required: true,
    type: String,
    example: 'clxyz123',
  })
  @ApiResponse({
    status: 200,
    description: 'Request deleted successfully',
    schema: {
      example: {
        message: 'Hackathon request deleted successfully',
        data: {
          id: 'clxyz123',
          hackTitle: 'My Hackathon',
          hackSlug: 'my-hackathon',
          status: 'DELETED',
          organizationId: 'clxyz456',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Request not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Hackathon request not found',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User is not the organization owner',
    schema: {
      example: {
        statusCode: 403,
        message: 'You are not authorized to delete this request',
        error: 'Forbidden',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Request status does not allow deletion',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Cannot delete request with status APPROVED. Only PENDING requests can be deleted.',
        error: 'Bad Request',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/delete')
  async deleteRequest(
    @Param('id') requestId: string,
    @CurrentUser() user: UserMin,
  ) {
    return this.requestService.deleteRequest(requestId, user.id);
  }
}
