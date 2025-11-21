import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';

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
}
