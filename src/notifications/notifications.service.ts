import { Injectable, Logger } from '@nestjs/common';
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
}
