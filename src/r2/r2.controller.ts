import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { R2Service } from './r2.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

@Controller('r2')
export class R2Controller {
  constructor(private readonly r2: R2Service) {}

  @ApiOperation({ summary: 'Upload an image to R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // make filename unique
    const key = `4hacks/test/${Date.now()}-${file.originalname}`;
    const url = await this.r2.uploadFile(file.buffer, key, file.mimetype);

    return { url };
  }
}
