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
  DisableAccountDto,
  TwoFactorCodeDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './dto/update-profile.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { Provider, SessionStatus } from 'generated/prisma';
import {
  AccountDisableVerificationEmailTemplateHtml,
  AccountDisabledEmailTemplateHtml,
  PasswordChangedEmailTemplateHtml,
  TwoFactorEmailCodeTemplateHtml,
} from 'src/common/templates/emails.templates.list';
import type { Cache } from 'cache-manager';
import {
  accountDisableRedisPrefix,
  twoFactorDisableRedisPrefix,
  twoFactorEnableRedisPrefix,
  twoFactorEmailRedisTTL,
} from 'src/auth/constants';

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
        isDisabled: true,
        disabledAt: true,
        disabledReason: true,
        createdAt: true,
        updatedAt: true,
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
        isDisabled: true,
        disabledAt: true,
        disabledReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Profile updated for user: ${updatedProfile.username}`);

    return updatedProfile;
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const { currentPassword, newPassword, confirmPassword } =
      updatePasswordDto;

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

    if (
      !user.providers ||
      !user.providers.includes(Provider.CREDENTIAL)
    ) {
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
      throw new BadRequestException(
        'New password confirmation does not match',
      );
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
      message:
        'Password updated successfully. All sessions have been revoked.',
      passwordUpdatedAt,
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
      throw new BadRequestException('Two-factor authentication is already enabled');
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
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    const storedCode = await this.getTwoFactorCode(twoFactorEnableRedisPrefix, userId);
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

    const storedCode = await this.getTwoFactorCode(twoFactorDisableRedisPrefix, userId);
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

  async sendAccountDisableCode(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        isDisabled: true,
        providers: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isDisabled) {
      throw new BadRequestException('Account is already disabled');
    }

    const hasPassword = user.providers.includes(Provider.CREDENTIAL);

    if (!user.twoFactorEnabled && hasPassword) {
      throw new BadRequestException(
        'Use your password to disable the account. No verification code is required.',
      );
    }

    const code = this.generateVerificationCode();
    await this.saveTwoFactorCode(accountDisableRedisPrefix, userId, code);

    await this.emailService.sendEmail(
      user.email,
      'Confirm Account Disable',
      AccountDisableVerificationEmailTemplateHtml(code),
    );

    return {
      message: 'Account disable verification code sent to your email address.',
    };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async saveTwoFactorCode(prefix: string, userId: string, code: string) {
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

  private async validateAccountDisableCode(userId: string, code: string) {
    const storedCode = await this.getTwoFactorCode(
      accountDisableRedisPrefix,
      userId,
    );

    if (!storedCode) {
      throw new BadRequestException(
        'Account disable code has expired or was not requested. Please request a new code.',
      );
    }

    if (storedCode !== code) {
      throw new ForbiddenException('Invalid verification code');
    }

    await this.deleteTwoFactorCode(accountDisableRedisPrefix, userId);
  }

  async disableAccount(userId: string, disableDto: DisableAccountDto) {
    const { password, twoFactorCode, emailCode, reason } = disableDto;

    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        providers: true,
        twoFactorEnabled: true,
        isDisabled: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isDisabled) {
      throw new BadRequestException('Account is already disabled');
    }

    const hasPassword = user.providers.includes(Provider.CREDENTIAL);

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        throw new BadRequestException(
          'Two-factor authentication code is required to disable this account',
        );
      }

      await this.validateAccountDisableCode(userId, twoFactorCode);
    } else if (hasPassword) {
      if (!password) {
        throw new BadRequestException('Password is required to disable account');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new ForbiddenException('Invalid password');
      }
    } else {
      if (!emailCode) {
        throw new BadRequestException(
          'Email verification code is required to disable this account',
        );
      }

      await this.validateAccountDisableCode(userId, emailCode);
    }

    const disabledAt = new Date();

    // Update account and revoke all sessions
    await this.prisma.$transaction([
      this.prisma.users.update({
        where: { id: userId },
        data: {
          isDisabled: true,
          disabledAt,
          disabledReason: reason || null,
        },
      }),
      this.prisma.session.updateMany({
        where: { userId, status: SessionStatus.ACTIVE },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: disabledAt,
          revokedById: userId,
        },
      }),
    ]);

    // Send email notification
    await this.emailService.sendEmail(
      user.email,
      'Account Disabled',
      AccountDisabledEmailTemplateHtml(user.email, reason),
    );

    this.logger.log(`Account disabled for user: ${userId}`);

    return {
      message: 'Account has been disabled successfully',
      disabledAt,
      reason: reason || null,
    };
  }
}
