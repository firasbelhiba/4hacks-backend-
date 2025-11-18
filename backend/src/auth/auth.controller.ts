import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';

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

  @ApiOperation({
    summary: 'Login a user',
    description: 'Logs in a user and returns a JWT token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in.',
    schema: {
      example: {
        message: 'User logged in successfully',
        token: 'eyJfgsffgspd4...',
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
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.login(loginDto, res);
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token using a refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'The access token has been successfully refreshed.',
    schema: {
      example: {
        message: 'Access token refreshed successfully',
        token: 'eyJfgsffgspd4...',
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
    description: 'Bad Request. Refresh token is missing.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Refresh token is missing',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired refresh token.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid refresh token',
        error: 'Unauthorized',
      },
    },
  })
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshAccessToken(req, res);
  }
}
