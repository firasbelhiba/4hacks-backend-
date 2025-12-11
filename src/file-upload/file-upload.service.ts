import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { R2Service } from 'src/r2/r2.service';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(private readonly r2: R2Service) {}

  /**
   * Uploads a profile image to R2.
   * @param file - The uploaded image file.
   * @param userId - Optional user id to include in the object key.
   * @returns The public URL of the uploaded image.
   */
  async uploadProfileImage(
    file: Express.Multer.File,
    userId?: string,
  ): Promise<string> {
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

    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const key = userId
      ? `4hacks/profiles/${userId}/${timestamp}-${safeName}`
      : `4hacks/profiles/${timestamp}-${safeName}`;

    this.logger.log(`Uploading profile image to R2 - key: ${key}`);

    try {
      const publicUrl = await this.r2.uploadFile(
        file.buffer,
        key,
        file.mimetype,
      );

      this.logger.log(`Image uploaded to R2 - url: ${publicUrl}`);

      return publicUrl;
    } catch (err) {
      this.logger.error('R2 upload failed, error uploading profile image', err);

      throw err;
    }
  }

  /**
   * Uploads an organization logo to R2.
   * @param file - The uploaded logo file.
   * @param organizationSlug - Organization slug to include in the object key.
   * @returns The public URL of the uploaded logo.
   */
  async uploadOrganizationLogo(
    file: Express.Multer.File,
    organizationSlug: string,
  ): Promise<string> {
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

    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const key = `4hacks/organizations/logos/${organizationSlug}/${timestamp}-${safeName}`;

    this.logger.log(`Uploading organization logo to R2 - key: ${key}`);

    try {
      const publicUrl = await this.r2.uploadFile(
        file.buffer,
        key,
        file.mimetype,
      );

      this.logger.log(`Organization logo uploaded to R2 - url: ${publicUrl}`);

      return publicUrl;
    } catch (err) {
      this.logger.error(
        'R2 upload failed, error uploading organization logo',
        err,
      );

      throw err;
    }
  }

  async uploadTeamImage(
    file: Express.Multer.File,
    hackathonId: string,
    teamName: string,
  ): Promise<string> {
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

    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const key = `4hacks/teams/${hackathonId}/${teamName}/${timestamp}-${safeName}`;

    this.logger.log(`Uploading team image to R2 - key: ${key}`);

    try {
      const publicUrl = await this.r2.uploadFile(
        file.buffer,
        key,
        file.mimetype,
      );

      this.logger.log(`Team image uploaded to R2 - url: ${publicUrl}`);

      return publicUrl;
    } catch (err) {
      this.logger.error('R2 upload failed, error uploading team image', err);

      throw err;
    }
  }
}
