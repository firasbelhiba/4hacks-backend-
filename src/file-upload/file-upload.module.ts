import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { R2Module } from 'src/r2/r2.module';

@Module({
  imports: [R2Module],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
