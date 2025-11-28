import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from 'generated/prisma';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { BanUserDto } from './dto/ban-user.dto';

@ApiTags('Admin - User Management')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Ban a user account',
    description:
      'Bans a user account. This action can only be performed by administrators. The banned user will be logged out of all active sessions and will receive an email notification with the reason for the ban. Administrators cannot ban other administrators.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user to ban',
    example: 'cmiiu464o0005qsllk4qod2by',
  })
  @ApiResponse({
    status: 201,
    description: 'User banned successfully',
    schema: {
      example: {
        message: 'User has been banned successfully',
        userId: 'cmiiu464o0005qsllk4qod2by',
        bannedAt: '2025-11-28T15:30:00.000Z',
        reason: 'Violation of community guidelines - spam and harassment',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request - User is already banned or trying to ban an administrator',
    schema: {
      examples: {
        'User already banned': {
          value: {
            statusCode: 400,
            message: 'User is already banned',
            error: 'Bad Request',
          },
        },
        'Cannot ban admin': {
          value: {
            statusCode: 400,
            message: 'Cannot ban another administrator',
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiForbiddenResponse({
    description: 'Forbidden - User does not have ADMIN role',
  })
  @ApiBody({
    type: BanUserDto,
    description: 'Ban reason (required). This will be sent to the user via email.',
    examples: {
      'Violation example': {
        value: {
          reason: 'Violation of community guidelines - spam and harassment',
        },
      },
      'Terms violation': {
        value: {
          reason: 'Repeated violation of terms of service',
        },
      },
    },
  })
  @ApiBearerAuth()
  @Post(':userId/ban')
  async banUser(
    @Param('userId') userId: string,
    @CurrentUser('id') adminId: string,
    @Body() banDto: BanUserDto,
  ) {
    return await this.usersService.banUser(userId, adminId, banDto);
  }
}

