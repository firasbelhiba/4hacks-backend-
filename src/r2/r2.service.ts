// src/r2.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import {
  R2_ACCESS_KEY_ID,
  R2_ACCOUNT_ID,
  R2_BUCKET,
  R2_PUBLIC_URL,
  R2_SECRET_ACCESS_KEY,
} from './constants';

@Injectable()
export class R2Service {
  private s3: S3Client;
  private bucket = R2_BUCKET;
  constructor() {
    const accountId = R2_ACCOUNT_ID;
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType = 'application/octet-stream',
  ) {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3.send(cmd);

    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return publicUrl;
  }
}
