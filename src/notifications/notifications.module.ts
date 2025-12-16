import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationGateway } from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [PrismaModule, JwtModule],
  providers: [NotificationsService, NotificationGateway],
  controllers: [NotificationsController],
  exports: [NotificationGateway],
})
export class NotificationsModule {}
