import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { type UserMin } from 'src/common/types';
import { NotificationsService } from './notifications.service';
import { GetUserNotificationsDto } from './dto/notfications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'Get user notifications',
    description:
      'Get all user notifications with pagination ordered by createdAt desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Get user notifications',
    example: {
      notifications: [
        {
          id: 'cmioby82u00027gfd9agtfscq',
          toUserId: 'cmin445l20000dwfd2t8mlsgi',
          fromUserId: 'cmin2t3v40000ogfd9ukjh1tn',
          type: 'TEAM_INVITE',
          content:
            'You have been invited to join team Buoya 1 for hackathon hedera-africa-hackathon-2027 By aibuoya',
          payload: {
            teamId: 'cmin8fwfm0001o0fd7umnjxks',
            hackathonId: 'cmimw0vlx00053ofdy2gnfwfy',
          },
          isRead: false,
          createdAt: '2025-12-02T08:42:32.934Z',
        },
        {
          id: 'cmiobryrf0001ukfdov2oe58r',
          toUserId: 'cmin445l20000dwfd2t8mlsgi',
          fromUserId: 'cmin2t3v40000ogfd9ukjh1tn',
          type: 'TEAM_MEMBER_REMOVED',
          content:
            'You have been removed from team Buoya 1 for hackathon cmimw0vlx00053ofdy2gnfwfy by aibuoya',
          payload: {
            teamId: 'cmin8fwfm0001o0fd7umnjxks',
            hackathonId: 'cmimw0vlx00053ofdy2gnfwfy',
          },
          isRead: false,
          createdAt: '2025-12-02T08:37:40.923Z',
        },
      ],
      total: 7,
      page: 3,
      limit: 2,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @Get('')
  async getUserNotifications(
    @CurrentUser() user: UserMin,
    @Query() query: GetUserNotificationsDto,
  ) {
    return await this.notificationsService.getUserNotifications(user, query);
  }

  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark notification as read',
  })
  @ApiResponse({
    status: 200,
    description: 'Mark notification as read',
    example: {
      message: 'Notification marked as read',
      data: {
        id: 'cmiobryrf0001ukfdov2oe58r',
        content:
          'You have been removed from team Buoya 1 for hackathon cmimw0vlx00053ofdy2gnfwfy by aibuoya',
        isRead: true,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @ApiNotFoundResponse({
    description: 'Notification not found',
  })
  @ApiForbiddenResponse({
    description: 'You are forbidden to mark this notification as read',
  })
  @ApiBadRequestResponse({
    description: 'Notification is already read',
  })
  @Patch(':id/mark-as-read')
  async markNotificationAsRead(
    @CurrentUser() user: UserMin,
    @Param('id') id: string,
  ) {
    return await this.notificationsService.markNotificationAsRead(user, id);
  }
}
