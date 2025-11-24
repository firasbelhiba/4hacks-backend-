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
  ApiProperty,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {
  DisableAccountDto,
  TwoFactorCodeDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './dto/update-profile.dto';

@ApiTags('Profile Management')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({
    summary: 'Get User Profile by Username',
    description:
      'Retrieve the profile information of a user using their username.',
  })
  @ApiProperty({
    name: 'username',
    description: 'Get user profile by username',
    example: 'ayoubbuoya',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the user profile.',
    schema: {
      example: {
        id: 'clxsu9vgo0000lmk7z9h8f1q',
        username: 'ayoubbuoya',
        name: 'Ayoub',
        email: 'ayoub@gmail.com',
        role: 'USER',
        bio: 'Full-stack developer and tech enthusiast.',
        avatarUrl: 'https://example.com/avatars/ayoubbuoya.png',
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
  @Get(':username')
  async getProfileByUsername(@Param('username') username: string) {
    return await this.profileService.getProfileByUsername(username);
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
        updatedAt: '2025-11-21T10:30:00.000Z',
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Request 2FA enable code',
    description:
      'Sends a 6-digit verification code to the user email to enable two-factor authentication.',
  })
  @ApiResponse({
    status: 200,
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Request 2FA disable code',
    description:
      'Sends a 6-digit verification code to the user email to disable two-factor authentication.',
  })
  @Post('2fa/disable')
  async sendTwoFactorDisableCode(@CurrentUser('id') userId: string) {
    return await this.profileService.sendTwoFactorDisableCode(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verify 2FA disable code',
    description: 'Validates the emailed verification code and disables 2FA.',
  })
  @Post('2fa/disable/verify')
  async verifyTwoFactorDisable(
    @CurrentUser('id') userId: string,
    @Body() codeDto: TwoFactorCodeDto,
  ) {
    return await this.profileService.verifyTwoFactorDisable(userId, codeDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Disable user account',
    description:
      'Permanently disables the authenticated user account. Requires password or 2FA code confirmation. All sessions will be revoked.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account disabled successfully.',
    schema: {
      example: {
        message: 'Account has been disabled successfully',
        disabledAt: '2025-11-24T15:30:00.000Z',
        reason: 'No longer using the platform',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation or business rule violated.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Account is already disabled',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Invalid password or 2FA code.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Invalid password',
        error: 'Forbidden',
      },
    },
  })
  @Post('disable')
  async disableAccount(
    @CurrentUser('id') userId: string,
    @Body() disableDto: DisableAccountDto,
  ) {
    return await this.profileService.disableAccount(userId, disableDto);
  }
}
