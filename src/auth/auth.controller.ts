import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, VerifyTwoFactorLoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import {
  AUTH_REFRESH_API_PREFIX,
  authCookiesNames,
  FRONTEND_URL,
  refreshTokenConstants,
} from './constants';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github.guard';
import { LinkedinAuthGuard } from './guards/linkedin.guard';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
    status: 201,
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

    if (result.requiresTwoFactor) {
      return {
        message: result.message,
        requiresTwoFactor: true,
        challengeId: result.challengeId,
      };
    }

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
    summary: 'Verify two-factor login code',
    description: 'Verifies the emailed 2FA code and completes the login.',
  })
  @ApiBody({ type: VerifyTwoFactorLoginDto })
  @ApiResponse({
    status: 201,
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
  @Post('2fa/verify-login')
  async verifyTwoFactorLogin(
    @Body() dto: VerifyTwoFactorLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyLoginTwoFactor(dto);

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
    status: 201,
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
    status: 201,
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

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully logged out from all devices.',
    schema: {
      example: {
        message: 'User logged out successfully from all devices',
      },
    },
  })
  @Post('logout-all')
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Logout the user from all sessions
    await this.authService.logoutAll(userId);

    // Clear the Current refresh token cookie
    res.clearCookie(authCookiesNames.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: AUTH_REFRESH_API_PREFIX,
    });

    return {
      message: 'User logged out successfully from all devices',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns the currently authenticated user.',
    schema: {
      example: {
        id: 'clxsu9vgo0000lmk7z9h8f1q',
        username: 'ahmed12',
        name: 'Ahmed',
        email: 'ahmed@gmail.com',
        role: 'USER',
        createdAt: '2025-10-01T12:34:56.789Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Missing or invalid access token.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  me(@CurrentUser() user: any) {
    return user;
  }

  @ApiOperation({
    summary: 'Sends a verification email to the authenticated user',
    description:
      'Sends a verification email to the authenticated user containing a verification code.',
  })
  @ApiResponse({
    status: 201,
    description: 'Email Sent Successfully',
    schema: {
      example: {
        email: 'user@example.com',
        message: 'Verification email sent successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Missing or invalid access token.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('email/verify/send')
  async verifyEmailSend(@CurrentUser('id') userId: string) {
    return this.authService.verifyEmailSend(userId);
  }

  @ApiOperation({
    summary: 'Verifies the email of the authenticated user',
    description:
      'Verifies the email of the authenticated user using a verification code.',
  })
  @ApiResponse({
    status: 201,
    description: 'Email Verified Successfully',
    schema: {
      example: {
        message: 'Email verified successfully',
        email: 'user@example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid or expired verification code.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired verification code',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Missing or invalid access token.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('email/verify')
  async verifyEmail(
    @CurrentUser('id') userId: string,
    @Body() body: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(userId, body.code);
  }

  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends a password reset email with a secure token link. Only available for users with credential-based accounts.',
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({
    status: 201,
    description: 'Password reset email sent (if account exists)',
    schema: {
      example: {
        message:
          'If an account with that email exists, a password reset link has been sent',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid email format.',
    schema: {
      example: {
        statusCode: 400,
        message: ['Please provide a valid email address'],
        error: 'Bad Request',
      },
    },
  })
  @Post('password/reset/request')
  async requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Resets the user password using the token received via email. All active sessions will be invalidated for security.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 201,
    description: 'Password reset successfully',
    schema: {
      example: {
        message:
          'Password reset successful. All sessions have been logged out for security',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request. Invalid/expired token, OAuth-only account, or validation errors.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired reset token',
        error: 'Bad Request',
      },
    },
  })
  @Post('password/reset')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  ////// Google OAuth routes here //////
  @ApiOperation({
    summary: 'Initiate Google OAuth2 login',
    description:
      'Redirects the user to Google for authentication. This ednpoint cannot be tested via Swagger UI. To test it, please use a web browser to navigate to /api/v1/auth/google/login',
  })
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @ApiOperation({
    summary: 'Google OAuth2 callback',
    description:
      'Handles the callback from Google after authentication. This endpoint cannot be tested via Swagger UI. It will be called by Google after user authentication using the first /api/v1/auth/google/login endpoint.',
  })
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('Google OAuth callback reached for userId:', userId);

    const result = await this.authService.handleGoogleOAuthCallback(userId);

    // Set refresh token as HttpOnly cookie
    res.cookie(authCookiesNames.refreshToken, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenConstants.expirationSeconds * 1000,
      path: AUTH_REFRESH_API_PREFIX,
    });

    res.redirect(`${FRONTEND_URL}?token=${result.accessToken}`);
  }

  ///// GitHub OAuth routes here //////
  @ApiOperation({
    summary: 'Initiate GitHub OAuth2 login',
    description:
      'Redirects the user to GitHub for authentication. This ednpoint cannot be tested via Swagger UI. To test it, please use a web browser to navigate to /api/v1/auth/github/login',
  })
  @UseGuards(GithubAuthGuard)
  @Get('github/login')
  githubLogin() {}

  @ApiOperation({
    summary: 'GitHub OAuth2 callback',
    description:
      'Handles the callback from GitHub after authentication. This endpoint cannot be tested via Swagger UI. It will be called by GitHub after user authentication using the first /api/v1/auth/github/login endpoint.',
  })
  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
  async githubCallback(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('GitHub OAuth callback reached');

    const result = await this.authService.handleGithubOAuthCallback(userId);

    // Set refresh token as HttpOnly cookie
    res.cookie(authCookiesNames.refreshToken, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenConstants.expirationSeconds * 1000,
      path: AUTH_REFRESH_API_PREFIX,
    });

    res.redirect(`${FRONTEND_URL}?token=${result.accessToken}`);
  }

  ///// LinkedIn OAuth routes here //////
  @ApiOperation({
    summary: 'Initiate LinkedIn OAuth2 login',
    description:
      'Redirects the user to LinkedIn for authentication. This endpoint cannot be tested via Swagger UI. To test it, please use a web browser to navigate to /api/v1/auth/linkedin/login',
  })
  @UseGuards(LinkedinAuthGuard)
  @Get('linkedin/login')
  linkedinLogin() {}

  @ApiOperation({
    summary: 'LinkedIn OAuth2 callback',
    description:
      'Handles the callback from LinkedIn after authentication. This endpoint cannot be tested via Swagger UI. It will be called by LinkedIn after user authentication using the first /api/v1/auth/linkedin/login endpoint.',
  })
  @UseGuards(LinkedinAuthGuard)
  @Get('linkedin/callback')
  async linkedinCallback(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('LinkedIn OAuth callback reached');

    const result = await this.authService.handleLinkedinOAuthCallback(userId);

    // Set refresh token as HttpOnly cookie
    res.cookie(authCookiesNames.refreshToken, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenConstants.expirationSeconds * 1000,
      path: AUTH_REFRESH_API_PREFIX,
    });

    res.redirect(`${FRONTEND_URL}?token=${result.accessToken}`);
  }
}
