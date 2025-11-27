import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({ adapter });
  }

  async onModuleInit() {
    // Connect to the database when the module is initialized
    try {
      this.logger.log('Connecting to the database');
      await this.$connect();
      this.logger.log('Connected to the database');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    // Disconnect from the database when the module is destroyed
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from the database');
    } catch (error) {
      this.logger.error('Failed to disconnect from the database', error);
      throw error;
    }
  }
}
