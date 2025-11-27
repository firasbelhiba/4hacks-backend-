import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, FileUploadModule, EmailModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
