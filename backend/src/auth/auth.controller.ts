import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered.',
    schema: {
      example: {
        message: 'User registered successfully',
        user: {
          id: 'clxsu9vgo0000lmk7z9h8f1q',
          username: 'ahmed12',
          name: 'Ahmed',
          email: 'ahmed@gmail.com',
          role: 'USER',
          createdAt: '2025-10-01T12:34:56.789Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed.',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Email must be a valid email',
          'Password must be at least 8 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Email or username already exists.',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
