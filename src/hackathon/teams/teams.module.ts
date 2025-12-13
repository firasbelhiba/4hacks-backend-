import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, FileUploadModule, EmailModule],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
