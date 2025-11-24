import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [PrismaModule, FileUploadModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
