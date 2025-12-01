import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {
  ChangeEmailDto,
  TwoFactorCodeDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './dto/update-profile.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import {
  OrganisationPublicDto,
  OrganisationPrivateDto,
} from './dto/organisation-response.dto';
import type { UserMin } from 'src/common/types';

@ApiTags('Profile Management')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({
    summary: 'Get User Profile by Username',
    description:
      'Retrieve the profile information of a user using their username. **Public fields** (name, bio, social links, etc.) are shown to everyone. **Private fields** (email, whatsapp, telegram, security info) are only shown to the profile owner when authenticated. This endpoint works with or without authentication - if you are authenticated and viewing your own profile, you will see all fields including private ones.',
  })
  @ApiParam({
    name: 'username',
    description: 'The username of the user whose profile to retrieve',
    example: 'ayoubbuoya',
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns the user profile. **If unauthenticated or viewing another user's profile**: Only public fields are returned. **If authenticated and viewing your own profile**: All fields including private ones are returned.",
    schema: {
      examples: {
        'Public profile (unauthenticated or different user)': {
          value: {
            id: 'clxsu9vgo0000lmk7z9h8f1q',
            username: 'ayoubbuoya',
            name: 'Ayoub',
            role: 'USER',
            bio: 'Full-stack developer and tech enthusiast.',
            image: 'https://example.com/avatars/ayoubbuoya.png',
            profession: 'Senior Engineer',
            location: 'San Francisco, USA',
            org: 'Google',
            skills: ['JavaScript', 'TypeScript'],
            website: 'https://ayoubbuoya.com',
            github: 'https://github.com/ayoubbuoya',
            linkedin: 'https://linkedin.com/in/ayoubbuoya',
            twitter: 'https://twitter.com/ayoubbuoya',
            otherSocials: ['https://instagram.com/ayoubbuoya'],
            providers: ['CREDENTIAL', 'GOOGLE'],
            isEmailVerified: true,
            emailVerifiedAt: '2025-11-21T10:30:00.000Z',
            walletAddress: null,
            createdAt: '2025-11-01T08:00:00.000Z',
            updatedAt: '2025-11-24T12:00:00.000Z',
          },
          description:
            "Response when viewing someone else's profile or when not authenticated. Private fields (email, whatsapp, telegram, security info) are not included.",
        },
        'Own profile (authenticated as owner)': {
          value: {
            id: 'clxsu9vgo0000lmk7z9h8f1q',
            username: 'ayoubbuoya',
            name: 'Ayoub',
            email: 'ayoub@gmail.com',
            role: 'USER',
            bio: 'Full-stack developer and tech enthusiast.',
            image: 'https://example.com/avatars/ayoubbuoya.png',
            profession: 'Senior Engineer',
            location: 'San Francisco, USA',
            org: 'Google',
            skills: ['JavaScript', 'TypeScript'],
            website: 'https://ayoubbuoya.com',
            github: 'https://github.com/ayoubbuoya',
            linkedin: 'https://linkedin.com/in/ayoubbuoya',
            telegram: '@ayoubbuoya',
            twitter: 'https://twitter.com/ayoubbuoya',
            whatsapp: '+1234567890',
            otherSocials: ['https://instagram.com/ayoubbuoya'],
            providers: ['CREDENTIAL', 'GOOGLE'],
            isEmailVerified: true,
            emailVerifiedAt: '2025-11-21T10:30:00.000Z',
            walletAddress: null,
            lastLoginAt: '2025-11-23T09:00:00.000Z',
            passwordUpdatedAt: '2025-11-24T10:00:00.000Z',
            twoFactorEnabled: true,
            twoFactorConfirmedAt: '2025-11-24T11:00:00.000Z',
            isBanned: false,
            bannedAt: null,
            bannedReason: null,
            createdAt: '2025-11-01T08:00:00.000Z',
            updatedAt: '2025-11-24T12:00:00.000Z',
          },
          description:
            'Response when authenticated and viewing your own profile. Includes all fields including private ones.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Profile not found.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Profile not found',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized - Invalid JWT token (only if token is provided but invalid). Note: This endpoint works without authentication.',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':username')
  async getProfileByUsername(
    @Param('username') username: string,
    @CurrentUser('id') userId?: string,
  ) {
    return await this.profileService.getProfileByUsername(username, userId);
  }

  @ApiOperation({
    summary: "Get a user's organisations",
    description:
      'Retrieve organisations created/owned by a user (identified by username or id). Public organisation fields are visible to everyone. Sensitive details (contact email, phone, address, ownerId) are only visible to the organisation owner or admins when authenticated.',
  })
  @ApiParam({
    name: 'identifier',
    description: "User's username or id",
    example: 'ayoubbuoya',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of organisations. Sensitive fields are shown only to admins or the org owner.',
    type: OrganisationPublicDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'User not found.' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':identifier/organisations')
  async getUserOrganisations(
    @Param('identifier') identifier: string,
    @CurrentUser() requester?: UserMin,
  ) {
    return await this.profileService.getUserOrganisations(
      identifier,
      requester,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update User Profile',
    description:
      'Update the authenticated user profile. Only the profile owner can update their own profile. Supports profile image upload.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile update data with optional image upload',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'John Doe',
          description: 'Full name of the user',
        },
        bio: {
          type: 'string',
          example: 'Full-stack developer passionate about blockchain',
          description: 'User biography',
        },
        profession: {
          type: 'string',
          example: 'Senior Software Engineer',
          description: 'User profession or job title',
        },
        location: {
          type: 'string',
          example: 'San Francisco, USA',
          description: 'User location',
        },
        org: {
          type: 'string',
          example: 'Google',
          description: 'Organization name',
        },
        skills: {
          type: 'array',
          items: { type: 'string' },
          example: ['JavaScript', 'TypeScript', 'React', 'NestJS'],
          description: 'Array of user skills',
        },
        website: {
          type: 'string',
          example: 'https://johndoe.com',
          description: 'Personal website URL',
        },
        github: {
          type: 'string',
          example: 'https://github.com/johndoe',
          description: 'GitHub profile',
        },
        linkedin: {
          type: 'string',
          example: 'https://linkedin.com/in/johndoe',
          description: 'LinkedIn profile',
        },
        telegram: {
          type: 'string',
          example: '@johndoe',
          description: 'Telegram username',
        },
        twitter: {
          type: 'string',
          example: 'https://twitter.com/johndoe',
          description: 'Twitter profile',
        },
        whatsapp: {
          type: 'string',
          example: '+1234567890',
          description: 'WhatsApp number',
        },
        otherSocials: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://instagram.com/johndoe'],
          description: 'Other social media links',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Profile image file (JPEG, PNG, or WebP, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
    schema: {
      example: {
        id: 'clxsu9vgo0000lmk7z9h8f1q',
        username: 'ayoubbuoya',
        name: 'Ayoub Buoya',
        email: 'ayoub@gmail.com',
        role: 'USER',
        bio: 'Full-stack developer and tech enthusiast.',
        image: '/uploads/profiles/1234567890-profile.jpg',
        profession: 'Senior Software Engineer',
        location: 'San Francisco, USA',
        org: 'Google',
        skills: ['JavaScript', 'TypeScript', 'React', 'NestJS'],
        website: 'https://ayoubbuoya.com',
        github: 'https://github.com/ayoubbuoya',
        linkedin: 'https://linkedin.com/in/ayoubbuoya',
        telegram: '@ayoubbuoya',
        twitter: 'https://twitter.com/ayoubbuoya',
        whatsapp: '+1234567890',
        otherSocials: ['https://instagram.com/ayoubbuoya'],
        providers: ['CREDENTIAL', 'GOOGLE'],
        isEmailVerified: true,
        emailVerifiedAt: '2025-11-21T10:30:00.000Z',
        lastLoginAt: '2025-11-23T09:00:00.000Z',
        passwordUpdatedAt: '2025-11-24T10:00:00.000Z',
        twoFactorEnabled: true,
        twoFactorConfirmedAt: '2025-11-24T11:00:00.000Z',
        isBanned: false,
        bannedAt: null,
        bannedReason: null,
        createdAt: '2025-11-01T08:00:00.000Z',
        updatedAt: '2025-11-24T12:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid file type or size.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        error: 'Bad Request',
      },
    },
  })
  @Patch('')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    console.log('updateProfile reached', updateProfileDto, image);
    return await this.profileService.updateProfile(
      userId,
      updateProfileDto,
      image,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update account password',
    description:
      'Allow the authenticated user to change their password. Requires current password confirmation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully.',
    schema: {
      example: {
        message:
          'Password updated successfully. All sessions have been revoked.',
        passwordUpdatedAt: '2025-11-24T13:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation or business rule violated.',
    schema: {
      example: {
        statusCode: 400,
        message: 'New password must be different from the current password',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Current password incorrect.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Current password is incorrect',
        error: 'Forbidden',
      },
    },
  })
  @Patch('password')
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.profileService.updatePassword(userId, updatePasswordDto);
  }

  @ApiOperation({
    summary: 'Update account username',
    description: 'Allow the authenticated user to change their username.',
  })
  @ApiBody({
    type: UpdateUsernameDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Username updated successfully.',
    schema: {
      example: {
        message: 'Username updated successfully.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation or business rule violated.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Username is already in use',
        error: 'Bad Request',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('username')
  async updateUsername(
    @CurrentUser('id') userId: string,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    return await this.profileService.updateUsername(userId, updateUsernameDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Request email change verification code',
    description:
      'Sends a 6-digit verification code to the user current email address. Required only if two-factor authentication is enabled. Users who created their account using OAuth providers (Google, GitHub, LinkedIn) cannot change their email.',
  })
  @ApiResponse({
    status: 201,
    description: 'Verification code sent to current email address.',
    schema: {
      example: {
        message:
          'Verification code sent to your current email address. Use this code to complete the email change.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - User cannot change email or 2FA is not enabled.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Email change is only available for users who created their account with credentials',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @Post('email/change-code')
  async sendChangeEmailCode(@CurrentUser('id') userId: string) {
    return await this.profileService.sendChangeEmailCode(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Change user email address',
    description:
      'Changes the authenticated user email address. Requires current password verification. Only users who created their account with credentials (not OAuth providers) can change email. If 2FA is enabled, a verification code sent to the old email is also required. The new email will be marked as unverified after the change. Users can request a code using the /email/change-code endpoint first.',
  })
  @ApiBody({
    type: ChangeEmailDto,
    description:
      'Current password, new email address, and optional 2FA code (required if 2FA is enabled)',
  })
  @ApiResponse({
    status: 200,
    description: 'Email changed successfully.',
    schema: {
      example: {
        message: 'Email address changed successfully',
        newEmail: 'newemail@example.com',
        isEmailVerified: false,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation or business rule violated.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Email change is only available for users who created their account with credentials',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Invalid password or 2FA verification code.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Current password is incorrect',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @Patch('email')
  async changeEmail(
    @CurrentUser('id') userId: string,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    return await this.profileService.changeEmail(userId, changeEmailDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Request 2FA enable code',
    description:
      'Sends a 6-digit verification code to the user email to enable two-factor authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Verification code sent to email.',
    schema: {
      example: {
        message: 'Verification code sent to your email address.',
      },
    },
  })
  @Post('2fa/enable')
  async sendTwoFactorEnableCode(@CurrentUser('id') userId: string) {
    return await this.profileService.sendTwoFactorEnableCode(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verify 2FA enable code',
    description: 'Validates the emailed verification code and enables 2FA.',
  })
  @Post('2fa/enable/verify')
  async verifyTwoFactorEnable(
    @CurrentUser('id') userId: string,
    @Body() codeDto: TwoFactorCodeDto,
  ) {
    return await this.profileService.verifyTwoFactorEnable(userId, codeDto);
  }

  @ApiOperation({
    summary: 'Request 2FA disable code',
    description:
      'Sends a 6-digit verification code to the user email to disable two-factor authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Verification code sent to email.',
    schema: {
      example: {
        message: 'Verification code sent to your email address.',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Two-factor authentication is not enabled.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Two-factor authentication is not enabled',
        error: 'Bad Request',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async sendTwoFactorDisableCode(@CurrentUser('id') userId: string) {
    return await this.profileService.sendTwoFactorDisableCode(userId);
  }

  @ApiOperation({
    summary: 'Verify 2FA disable code',
    description: 'Validates the emailed verification code and disables 2FA.',
  })
  @ApiResponse({
    status: 201,
    description: '2FA disabled successfully.',
    schema: {
      example: {
        message: '2FA disabled successfully.',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request - Verification code has expired or was not requested. Please request a new code.',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Verification code has expired or was not requested. Please request a new code.',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({
    type: TwoFactorCodeDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable/verify')
  async verifyTwoFactorDisable(
    @CurrentUser('id') userId: string,
    @Body() codeDto: TwoFactorCodeDto,
  ) {
    return await this.profileService.verifyTwoFactorDisable(userId, codeDto);
  }
}
