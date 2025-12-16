import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ChangeEmailDto,
  TwoFactorCodeDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './dto/update-profile.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import {
  HackathonStatus,
  Provider,
  SessionStatus,
  UserRole,
} from '@prisma/client';
import {
  PasswordChangedEmailTemplateHtml,
  TwoFactorEmailCodeTemplateHtml,
} from 'src/common/templates/emails/user.emails';
import type { Cache } from 'cache-manager';
import {
  changeEmailRedisPrefix,
  twoFactorDisableRedisPrefix,
  twoFactorEnableRedisPrefix,
  twoFactorEmailRedisTTL,
} from 'src/auth/constants';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UserMin } from 'src/common/types';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Retrieves the profile of a user by their username.
   * Public fields are shown to everyone, private fields only to the profile owner.
   * @param username - The username of the user.
   * @param userId - Optional ID of the authenticated user making the request.
   * @returns The user's profile with appropriate field visibility.
   */
  async getProfileByUsername(username: string, userId?: string) {
    // First, get the user ID to check ownership
    const user = await this.prisma.users.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException('Profile not found');
    }

    // Check if requester is the profile owner
    const isOwner = userId === user.id;

    // Fetch profile with conditional field selection
    const profile = await this.prisma.users.findUnique({
      where: { username },
      select: {
        // Public fields (always shown)
        id: true,
        name: true,
        username: true,
        role: true,
        bio: true,
        image: true,
        profession: true,
        location: true,
        org: true,
        skills: true,
        website: true,
        github: true,
        linkedin: true,
        twitter: true,
        otherSocials: true,
        providers: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true,
        // Private fields (only shown to owner)
        ...(isOwner
          ? {
              email: true,
              whatsapp: true,
              telegram: true,
              lastLoginAt: true,
              passwordUpdatedAt: true,
              twoFactorEnabled: true,
              twoFactorConfirmedAt: true,
              isBanned: true,
              bannedAt: true,
              bannedReason: true,
            }
          : {}),
      },
    });

    return profile;
  }

  /**
   * Retrieves organisations owned by a specific user identified by id or username.
   * Public fields are visible to everyone. Sensitive details (email, phone, address, ownerId)
   * are only visible to the organisation owner or users with ADMIN role.
   * @param identifier - user id or username
   * @param requester - optional user object of the authenticated requester
   */
  async getUserOrganisations(identifier: string, requester?: UserMin) {
    // Resolve target user by id first, then fallback to username
    // let target = await this.prisma.users.findUnique({
    //   where: { id: identifier },
    //   select: { id: true },
    // });

    // if (!target) {
    //   target = await this.prisma.users.findUnique({
    //     where: { username: identifier },
    //     select: { id: true },
    //   });
    // }

    const user = await this.prisma.users.findFirst({
      where: { OR: [{ id: identifier }, { username: identifier }] },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check if requester is owner or admin
    const isOwner = requester?.id === user.id;
    const isAdmin = requester?.role === UserRole.ADMIN;

    // Fetch organisations owned by the target user
    const orgs = await this.prisma.organization.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        name: true,
        slug: true,
        displayName: true,
        logo: true,
        tagline: true,
        description: true,
        website: true,
        linkedin: true,
        github: true,
        twitter: true,
        email: true,
        phone: true,
        ownerId: true,
        country: true,
        city: true,
        loc_address: true,
        otherSocials: true,
        createdAt: true,
        updatedAt: true,
        isArchived: true,
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
        hackathons: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            category: true,
            isPrivate: true,
            location: true,
            prizePool: true,
            prizeToken: true,
            banner: true,
            startDate: true,
            endDate: true,
            registrationStart: true,
            registrationEnd: true,
            status: true,
          },
          ...(isOwner || isAdmin
            ? {}
            : {
                where: {
                  status: HackathonStatus.ACTIVE,
                },
              }),
        },
      },
    });

    return orgs;
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
      imageUrl = await this.fileUploadService.uploadProfileImage(
        imageFile,
        userId,
      );
      this.logger.log(`Image uploaded for user: ${userId}, url: ${imageUrl}`);
    }

    // Update the user profile
    const updatedProfile = await this.prisma.users.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        ...(imageUrl ? { image: imageUrl } : {}),
      },
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
        org: true,
        skills: true,
        website: true,
        github: true,
        linkedin: true,
        telegram: true,
        twitter: true,
        whatsapp: true,
        otherSocials: true,
        providers: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        passwordUpdatedAt: true,
        twoFactorEnabled: true,
        twoFactorConfirmedAt: true,
        isBanned: true,
        bannedAt: true,
        bannedReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Profile updated for user: ${updatedProfile.username}`);

    return updatedProfile;
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = updatePasswordDto;

    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        email: true,
        providers: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.providers || !user.providers.includes(Provider.CREDENTIAL)) {
      throw new BadRequestException(
        'Password updates are only available for credential-based accounts',
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password confirmation does not match');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const passwordUpdatedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.users.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordUpdatedAt,
        },
      }),
      this.prisma.session.updateMany({
        where: { userId, status: SessionStatus.ACTIVE },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: passwordUpdatedAt,
          revokedById: userId,
        },
      }),
    ]);

    await this.emailService.sendEmail(
      user.email,
      'Password Changed Successfully',
      PasswordChangedEmailTemplateHtml(user.email),
    );

    this.logger.log(`Password updated for user: ${userId}`);

    return {
      message: 'Password updated successfully. All sessions have been revoked.',
      passwordUpdatedAt,
    };
  }

  /**
   * Updates the username of a user.
   * @param userId - The ID of the user to update.
   * @param updateUsernameDto - The data to update.
   * @returns The updated user profile.
   */
  async updateUsername(userId: string, updateUsernameDto: UpdateUsernameDto) {
    const { username } = updateUsernameDto;

    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.username === username) {
      throw new BadRequestException(
        'New username must be different from the current username',
      );
    }

    // Check if the username is already in use
    const existingUser = await this.prisma.users.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username is already in use');
    }

    // Update the username
    const updatedUser = await this.prisma.users.update({
      where: { id: userId },
      data: { username },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isEmailVerified: true,
      },
    });

    this.logger.log(`Username updated for user: ${updatedUser.username}`);

    return {
      message: 'Username updated successfully.',
      data: updatedUser,
    };
  }

  async sendTwoFactorEnableCode(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled',
      );
    }

    const code = this.generateVerificationCode();
    await this.saveTwoFactorCode(twoFactorEnableRedisPrefix, userId, code);

    await this.emailService.sendEmail(
      user.email,
      'Two-Factor Authentication Code',
      TwoFactorEmailCodeTemplateHtml(code, 'enable'),
    );

    return {
      message: 'Verification code sent to your email address.',
    };
  }

  async verifyTwoFactorEnable(userId: string, codeDto: TwoFactorCodeDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled',
      );
    }

    const storedCode = await this.getTwoFactorCode(
      twoFactorEnableRedisPrefix,
      userId,
    );
    if (!storedCode) {
      throw new BadRequestException(
        'Verification code has expired or was not requested. Please request a new code.',
      );
    }

    if (storedCode !== codeDto.code) {
      throw new ForbiddenException('Invalid verification code');
    }

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorConfirmedAt: new Date(),
      },
    });

    await this.deleteTwoFactorCode(twoFactorEnableRedisPrefix, userId);

    this.logger.log(`Two-factor authentication enabled for user: ${userId}`);

    return {
      message: 'Two-factor authentication enabled successfully',
    };
  }

  async sendTwoFactorDisableCode(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    const code = this.generateVerificationCode();
    await this.saveTwoFactorCode(twoFactorDisableRedisPrefix, userId, code);

    await this.emailService.sendEmail(
      user.email,
      'Two-Factor Disable Code',
      TwoFactorEmailCodeTemplateHtml(code, 'disable'),
    );

    return {
      message: 'Verification code sent to your email address.',
    };
  }

  async verifyTwoFactorDisable(userId: string, codeDto: TwoFactorCodeDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    const storedCode = await this.getTwoFactorCode(
      twoFactorDisableRedisPrefix,
      userId,
    );
    if (!storedCode) {
      throw new BadRequestException(
        'Verification code has expired or was not requested. Please request a new code.',
      );
    }

    if (storedCode !== codeDto.code) {
      throw new ForbiddenException('Invalid verification code');
    }

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorConfirmedAt: null,
      },
    });

    await this.deleteTwoFactorCode(twoFactorDisableRedisPrefix, userId);

    this.logger.log(`Two-factor authentication disabled for user: ${userId}`);

    return {
      message: 'Two-factor authentication disabled successfully',
    };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async saveTwoFactorCode(
    prefix: string,
    userId: string,
    code: string,
  ) {
    await this.cacheManager.set(
      this.getTwoFactorRedisKey(prefix, userId),
      code,
      twoFactorEmailRedisTTL,
    );
  }

  private async getTwoFactorCode(prefix: string, userId: string) {
    return await this.cacheManager.get<string>(
      this.getTwoFactorRedisKey(prefix, userId),
    );
  }

  private async deleteTwoFactorCode(prefix: string, userId: string) {
    await this.cacheManager.del(this.getTwoFactorRedisKey(prefix, userId));
  }

  private getTwoFactorRedisKey(prefix: string, userId: string) {
    return `${prefix}${userId}`;
  }

  /**
   * Sends a 2FA verification code to the user's current email address.
   * This is required before changing email if 2FA is enabled.
   * @param userId - The ID of the user requesting email change.
   * @returns A success message confirming the code was sent.
   */
  async sendChangeEmailCode(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        providers: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is allowed to change email (only credential-based users)
    if (!user.providers.includes(Provider.CREDENTIAL)) {
      throw new BadRequestException(
        'Email change is only available for users who created their account with credentials',
      );
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is not enabled. You can change your email directly without a verification code.',
      );
    }

    const code = this.generateVerificationCode();
    await this.saveTwoFactorCode(changeEmailRedisPrefix, userId, code);

    await this.emailService.sendEmail(
      user.email,
      'Email Change Verification Code',
      TwoFactorEmailCodeTemplateHtml(code, 'change-email'),
    );

    this.logger.log(
      `Email change verification code sent to: ${user.email} for user: ${userId}`,
    );

    return {
      message:
        'Verification code sent to your current email address. Use this code to complete the email change.',
    };
  }

  /**
   * Changes the user's email address.
   * - Only users with credential-based accounts (not OAuth-only) can change email.
   * - If 2FA is enabled, requires a verification code sent to the old email.
   * - The new email is always marked as unverified after the change.
   * @param userId - The ID of the user changing their email.
   * @param changeEmailDto - Contains the new email and optional 2FA code.
   * @returns A success message with the new email address.
   */
  async changeEmail(userId: string, changeEmailDto: ChangeEmailDto) {
    const { newEmail, twoFactorCode, password } = changeEmailDto;

    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        twoFactorEnabled: true,
        providers: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is allowed to change email (only credential-based users)
    if (!user.providers.includes(Provider.CREDENTIAL)) {
      throw new BadRequestException(
        'Email change is only available for users who created their account with credentials',
      );
    }

    // Validate current password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    // Check if new email is different from current email
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      throw new BadRequestException(
        'New email must be different from your current email address',
      );
    }

    // Check if new email is already taken
    const emailExists = await this.prisma.users.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });

    if (emailExists) {
      throw new BadRequestException('This email address is already in use');
    }

    // If 2FA is enabled, require and validate the code
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        throw new BadRequestException(
          'Two-factor authentication code is required to change your email. Please request a code first.',
        );
      }

      const storedCode = await this.getTwoFactorCode(
        changeEmailRedisPrefix,
        userId,
      );

      if (!storedCode) {
        throw new BadRequestException(
          'Verification code has expired or was not requested. Please request a new code.',
        );
      }

      if (storedCode !== twoFactorCode) {
        throw new ForbiddenException('Invalid verification code');
      }

      // Delete the code after successful validation
      await this.deleteTwoFactorCode(changeEmailRedisPrefix, userId);
    }

    // Update the email and mark as unverified
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        email: newEmail.toLowerCase(),
        isEmailVerified: false,
        emailVerifiedAt: null,
      },
    });

    this.logger.log(
      `Email changed for user: ${userId} from ${user.email} to ${newEmail}`,
    );

    return {
      message: 'Email address changed successfully',
      newEmail: newEmail.toLowerCase(),
      isEmailVerified: false,
    };
  }
}
