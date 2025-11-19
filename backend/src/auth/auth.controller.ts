import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import {
  AUTH_REFRESH_API_PREFIX,
  authCookiesNames,
  refreshTokenConstants,
} from './constants';

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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Set refresh token as HttpOnly cookie
    res.cookie(authCookiesNames.refreshToken, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenConstants.expirationSeconds * 1000,
      path: AUTH_REFRESH_API_PREFIX,
    });

    return {
      message: result.message,
      token: result.accessToken,
      user: result.user,
    };
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
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies[authCookiesNames.refreshToken];

    const result = await this.authService.refreshAccessToken(refreshToken);

    // Update refresh token in the HttpOnly cookie
    res.cookie(authCookiesNames.refreshToken, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenConstants.expirationSeconds * 1000,
      path: AUTH_REFRESH_API_PREFIX,
    });

    return {
      message: result.message,
      token: result.accessToken,
      user: result.user,
    };
  }

  @ApiOperation({
    summary: 'Logout a user',
    description: 'Logs out a user by invalidating the refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged out.',
    schema: {
      example: {
        message: 'User logged out successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Refresh token is missing or session not found.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Refresh token is missing',
        error: 'Bad Request',
      },
    },
  })
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[authCookiesNames.refreshToken];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing');
    }

    // Logout the user by deleting the session
    await this.authService.logout(refreshToken);

    // Clear the refresh token cookie
    res.clearCookie(authCookiesNames.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: AUTH_REFRESH_API_PREFIX,
    });

    return {
      message: 'User logged out successfully',
    };
  }
}
