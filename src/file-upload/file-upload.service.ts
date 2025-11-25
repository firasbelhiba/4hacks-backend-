import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  profileImageUploadsDirectory = join(
    process.cwd(),
    'src',
    'uploads',
    'profiles',
  );

  constructor() {
    this.logger.log('FileUploadService initialized');
    // Ensure the uploads directory is created at runtime if it doesn't exist
    this.ensureUploadsDirectoryExists();
  }

  private ensureUploadsDirectoryExists() {
    if (!existsSync(this.profileImageUploadsDirectory)) {
      mkdirSync(this.profileImageUploadsDirectory, { recursive: true });
    }
  }

  /**
   * Handles profile image upload.
   * This is a placeholder for actual cloud storage implementation.
   * @param file - The uploaded image file.
   * @returns The URL or path of the uploaded image.
   */
  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      throw new BadRequestException('File size must not exceed 5MB.');
    }

    // In production, replace this with actual cloud storage implementation
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;

    this.logger.log(
      `Image upload placeholder - filename: ${filename}, size: ${file.size}`,
    );

    this.logger.log('Uploading file to local storage...');

    // Save the file to the local uploads directory

    const filePath = join(this.profileImageUploadsDirectory, filename);

    const writeStream = createWriteStream(filePath);
    writeStream.end(file.buffer);

    this.logger.log(`File uploaded to local storage - path: ${filePath}`);

    return filePath;
  }
}
