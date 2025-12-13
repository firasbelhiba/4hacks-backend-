import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from './email/email.module';
import { ProfileModule } from './profile/profile.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { OrganizationModule } from './organization/organization.module';
import { HackathonModule } from './hackathon/hackathon.module';
import { R2Service } from './r2/r2.service';
import { R2Controller } from './r2/r2.controller';
import { R2Module } from './r2/r2.module';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { HackathonRequestModule } from './hackathon-request/hackathon-request.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CategoriesModule } from './categories/categories.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/customThrottlerGuard.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisUrl =
          configService.get('REDIS_URL') || 'redis://localhost:6379';

        // Create Keyv instance with Redis stores
        const keyvRedisStore = new KeyvRedis(redisUrl);

        return {
          stores: [keyvRedisStore],
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    EmailModule,
    ProfileModule,
    FileUploadModule,
    OrganizationModule,
    HackathonModule,
    R2Module,
    HackathonRequestModule,
    AdminModule,
    NotificationsModule,
    CategoriesModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 10, // 10 requests per minute
        },
      ],
    }),
  ],
  controllers: [R2Controller],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    R2Service,
  ],
})
export class AppModule {}
