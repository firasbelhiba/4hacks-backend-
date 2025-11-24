import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { createWriteStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  /**
   * Retrieves the profile of a user by their username.
   * @param username - The username of the user.
   * @returns The user's profile.
   */
  async getProfileByUsername(username: string) {
    const profile = await this.prisma.users.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        bio: true,
        image: true,
        profession: true,
        location: true,
        skills: true,
        website: true,
        github: true,
        linkedin: true,
        otherSocials: true,
      },
    });

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    return profile;
  }

  /**
   * Updates the profile of a user by their username.
   * Only the authenticated user can update their own profile.
   * @param username - The username of the user to update.
   * @param userId - The ID of the authenticated user making the request.
   * @param updateProfileDto - The data to update.
   * @param imageFile - Optional profile image file.
   * @returns The updated user profile.
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    imageFile?: Express.Multer.File,
  ) {
    // First, fetch the user by its ID
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Handle image upload if provided
    let imageUrl: string | undefined;
    if (imageFile) {
      // TODO: In production, replace this with actual file upload to cloud storage (e.g., AWS S3, Cloudinary)
      // For now, we'll store a local path
      this.logger.log('Uploading profile image...');
      imageUrl = await this.fileUploadService.uploadProfileImage(imageFile);
      this.logger.log(`Image uploaded for user: ${userId}, url: ${imageUrl}`);
    }

    // Update the user profile
    const updatedProfile = await this.prisma.users.update({
      where: { id: userId },
      data: {
        name: updateProfileDto.name,
        bio: updateProfileDto.bio,
        profession: updateProfileDto.profession,
        location: updateProfileDto.location,
        org: updateProfileDto.org,
        website: updateProfileDto.website,
        github: updateProfileDto.github,
        linkedin: updateProfileDto.linkedin,
        telegram: updateProfileDto.telegram,
        twitter: updateProfileDto.twitter,
        whatsapp: updateProfileDto.whatsapp,
        image: imageUrl,
      },
    });

    this.logger.log(`Profile updated for user: ${updatedProfile.username}`);

    return updatedProfile;
  }
}
