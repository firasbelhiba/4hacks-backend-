import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserMin } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetUserNotificationsDto } from './dto/notfications.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getUserNotifications(user: UserMin, query: GetUserNotificationsDto) {
    const page = Number(query.page);
    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;
    const take = limit;

    const notifications = await this.prismaService.notification.findMany({
      where: {
        toUserId: user.id,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prismaService.notification.count({
      where: {
        toUserId: user.id,
      },
    });

    return {
      notifications,
      total,
      page,
      limit,
    };
  }

  async markNotificationAsRead(user: UserMin, notificationId: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.toUserId !== user.id) {
      throw new ForbiddenException(
        'You are forbidden to mark this notification as read',
      );
    }

    if (notification.isRead) {
      throw new BadRequestException('Notification is already read');
    }

    const updatedNotification = await this.prismaService.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
      select: {
        id: true,
        content: true,
        isRead: true,
      },
    });

    return {
      message: 'Notification marked as read',
      data: updatedNotification,
    };
  }

  async markAllNotificationsAsRead(user: UserMin) {
    const result = await this.prismaService.notification.updateMany({
      where: {
        toUserId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      message: 'All notifications marked as read',
      notificationsCount: result.count,
    };
  }
}
