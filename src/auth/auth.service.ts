import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { Provider, SessionStatus, UserRole } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import {
  FRONTEND_URL,
  passwordResetRedisPrefix,
  passwordResetRedisTTL,
  refreshTokenConstants,
  verifyEmailRedisPrefix,
  verifyEmailRedisTTL,
} from './constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EmailService } from 'src/email/email.service';
import {
  PasswordResetConfirmationEmailTemplateHtml,
  PasswordResetEmailTemplateHtml,
  VerificationEmailTemplateHtml,
} from 'src/common/templates/emails.templates.list';
import { UserMin } from 'src/common/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly ENCRYPTION_KEY = createHash('sha256')
    .update(process.env.JWT_SECRET || 'fallback-secret-key')
    .digest(); // 32 bytes for AES-256

  private readonly IV_LENGTH = 16; // AES block size

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(
    registerDto: RegisterDto,
    provider: Provider = Provider.CREDENTIAL,
  ) {
    const { name, email, password, username: usernameBody } = registerDto;

    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // If no users exist, make the first registered user an admin
    const isFirstUser = (await this.prisma.users.count()) === 0;
    const role = isFirstUser ? UserRole.ADMIN : UserRole.USER;

    // Generate a default username from email
    const isGenratingNewUsername = !usernameBody;

    // If username is not provided, generate unique one from email
    const username = isGenratingNewUsername
      ? await this.generateUniqueUsername(email.split('@')[0])
      : usernameBody;

    // Check if the provided username is unique if it is given inside the request body
    if (!isGenratingNewUsername) {
      const isUsernameExists = await this.prisma.users.findUnique({
        where: { username },
      });

      if (isUsernameExists) {
        throw new ConflictException(
          'Username already exists. Please Provide another one.',
        );
      }
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new user
    const newUser = await this.prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        username,
        role,
        providers: [provider],
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        providers: true,
      },
    });

    this.logger.log(
      `New user registered: ${newUser.email} with role ${newUser.role}`,
    );

    return {
      message: 'User registered successfully',
      data: newUser,
    };
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;

    const isEmail = identifier.includes('@');

    const user = isEmail
      ? await this.prisma.users.findUnique({
          where: { email: identifier },
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            password: true,
            role: true,
            createdAt: true,
            providers: true,
          },
        })
      : await this.prisma.users.findUnique({
          where: { username: identifier },
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            password: true,
            role: true,
            createdAt: true,
            providers: true,
          },
        });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate Access and Refresh Tokens for the user
    const { accessToken, refreshToken } =
      await this.generateAccessAndRefreshTokens(user);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      message: 'User logged in successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  private async generateAccessAndRefreshTokens(
    user: UserMin,
    provider: Provider = Provider.CREDENTIAL,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const { token: refreshToken, hashedToken: hashedRefreshToken } =
      await this.generateUniqueRefreshToken();

    // Store refresh token in the database in a new session
    const refreshTokenExpiration = new Date(
      Date.now() + refreshTokenConstants.expirationSeconds * 1000,
    );

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        expiresAt: refreshTokenExpiration,
        provider,
      },
      select: { id: true },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refreshes the access token using the provided refresh token.
   * @param refreshToken - The refresh token to use for generating a new access token.
   * @returns An object containing the new access token, refresh token, and user details.
   */
  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token cookie is missing');
    }

    const hashedToken = this.hashRefreshToken(refreshToken);

    // get session by ID
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: hashedToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.status != SessionStatus.ACTIVE) {
      throw new UnauthorizedException('Session is not active');
    }

    // Verify refresh token expiration
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = session.user;

    // Generate new JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Access token refreshed for user: ${user.email}`);

    // Generate new refresh token
    const { token: newPlainRefreshToken, hashedToken: newHashedRefreshToken } =
      await this.generateUniqueRefreshToken();

    // Update session with new refresh token and expiration
    const newRefreshTokenExpiration = new Date(
      Date.now() + refreshTokenConstants.expirationSeconds * 1000,
    );

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newHashedRefreshToken,
        expiresAt: newRefreshTokenExpiration,
      },
    });

    this.logger.log(`Refresh token rotated for user: ${user.email}`);

    return {
      message: 'Access token refreshed successfully',
      accessToken,
      refreshToken: newPlainRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Logs out the user by deleting the session associated with the provided refresh token.
   * @param refreshToken - The refresh token to invalidate.
   */
  async logout(refreshToken: string) {
    const hashedToken = this.hashRefreshToken(refreshToken);

    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: hashedToken },
    });

    if (!session) {
      throw new BadRequestException('Session not found or already logged out');
    }

    // Update session status to revoked
    const deletedSession = await this.prisma.session.update({
      where: { id: session.id },
      data: { status: SessionStatus.REVOKED, revokedAt: new Date() },
    });

    this.logger.log(
      `Session ID: ${deletedSession.id} with refresh token ${hashedToken} logged out`,
    );
  }

  /**
   * Logs out all active sessions for the specified user.
   * @param userId - The ID of the user whose sessions are to be logged out.
   */
  async logoutAll(userId: string) {
    // Update all sessions for the user to revoked
    const result = await this.prisma.session.updateMany({
      where: { userId, status: SessionStatus.ACTIVE },
      data: { status: SessionStatus.REVOKED, revokedAt: new Date() },
    });

    if (result.count === 0) {
      this.logger.log(`No active sessions found for user ID: ${userId}`);
    } else {
      this.logger.log(`All active sessions for user ID: ${userId} logged out`);
    }
  }

  /**
   * Validates the user by ID and returns the user details.
   * @param userId - The ID of the user to validate.
   * @returns The user details if the user exists, otherwise throws an error.
   */
  async validateUserById(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async verifyEmailSend(userId: string) {
    // Find user by ID
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isEmailVerified: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate a verification code
    const verificationCode = this.generateVerificationCode();

    const redisKey = verifyEmailRedisPrefix + user.id;

    await this.cacheManager.set(
      redisKey,
      verificationCode,
      verifyEmailRedisTTL,
    );

    this.logger.log(
      `Verification code ${verificationCode} stored in Redis for user ID: ${user.id}`,
    );

    // Send the verification code via email using an email service
    await this.emailService.sendEmail(
      user.email,
      'Your Email Verification Code',
      VerificationEmailTemplateHtml(verificationCode, user.email),
    );

    return {
      email: user.email,
      message: 'Verification email sent successfully',
    };
  }

  /**
   * Verifies the user's email using the provided verification code.
   * @param userId - The ID of the user to verify.
   * @param code - The verification code to validate.
   * @returns A success message if the email is verified successfully.
   */
  async verifyEmail(
    userId: string,
    code: number,
  ): Promise<{ message: string; email: string }> {
    // Check if user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, isEmailVerified: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Get the verification code from Redis
    const redisKey = verifyEmailRedisPrefix + user.id;

    const storedCode = await this.cacheManager.get<number>(redisKey);

    if (!storedCode) {
      throw new BadRequestException(
        'Verification code has expired or is invalid',
      );
    }

    if (storedCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Update user's email verification status
    await this.prisma.users.update({
      where: { id: userId },
      data: { isEmailVerified: true, emailVerifiedAt: new Date() },
    });

    // Delete the verification code from Redis
    await this.cacheManager.del(redisKey);

    this.logger.log(`User ID: ${userId} email verified successfully`);

    return {
      message: 'Email verified successfully',
      email: user.email,
    };
  }

  /// Google OAuth Methods ////
  async validateGoogleQauthUser(email: string, name: string, image: string) {
    let user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        providers: true,
      },
    });

    if (user) {
      // If user exists, ensure Google is listed as a provider
      if (!user.providers.includes(Provider.GOOGLE)) {
        await this.prisma.users.update({
          where: { id: user.id },
          data: { providers: { push: Provider.GOOGLE } },
        });
      }
      return user;
    }

    // If user does not exist, create a new user
    const result = await this.register(
      {
        name,
        email,
        password: '',
      },
      Provider.GOOGLE,
    );

    return result.data;
  }

  async handleGoogleOAuthCallback(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        providers: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate Access and Refresh Tokens for the user
    const { accessToken, refreshToken } =
      await this.generateAccessAndRefreshTokens(user, Provider.GOOGLE);

    this.logger.log(`User logged in via Google OAuth: ${user.email}`);

    return {
      message: 'User logged in successfully via Google OAuth',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  /// Github OAuth Methods ////
  async validateGithubOAuthUser(
    email: string,
    name: string,
    image: string,
  ): Promise<UserMin> {
    console.log('Validating Github OAuth user');
    let user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        providers: true,
      },
    });

    if (user) {
      // If user exists, ensure Github is listed as a provider
      if (!user.providers.includes(Provider.GITHUB)) {
        await this.prisma.users.update({
          where: { id: user.id },
          data: { providers: { push: Provider.GITHUB } },
        });
      }
      return user;
    }

    console.log('Creating new user for Github OAuth');
    // If user does not exist, create a new user
    const result = await this.register(
      {
        name,
        email,
        password: '',
      },
      Provider.GITHUB,
    );

    return result.data;
  }

  async handleGithubOAuthCallback(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        providers: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate Access and Refresh Tokens for the user
    const { accessToken, refreshToken } =
      await this.generateAccessAndRefreshTokens(user, Provider.GITHUB);

    this.logger.log(`User logged in via Github OAuth: ${user.email}`);

    return {
      message: 'User logged in successfully via Github OAuth',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  //// Helper Methods ////

  /**
   * Requests a password reset by sending a reset link to the user's email.
   * Only users with CREDENTIAL provider can reset their password.
   * @param email - The email address of the user requesting password reset.
   * @returns A success message indicating the email was sent.
   */
  async requestPasswordReset(
    email: string,
  ): Promise<{ message: string; email: string }> {
    // Find user by email
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, providers: true, name: true },
    });

    // For security reasons, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`,
      );
      return {
        email,
        message:
          'If an account with that email exists, a password reset link has been sent',
      };
    }

    // Check if user has CREDENTIAL provider
    if (!user.providers.includes(Provider.CREDENTIAL)) {
      this.logger.warn(
        `Password reset requested for OAuth-only user: ${email}`,
      );
      // Don't reveal that the account exists but uses OAuth
      return {
        email,
        message:
          'If an account with that email exists, a password reset link has been sent',
      };
    }

    // Generate token with embedded userId (using the new private method)
    const { fullToken, randomPart } = this.generatePasswordResetToken(user.id);

    // Hash only the random part for Redis storage
    const hashedToken = createHash('sha256').update(randomPart).digest('hex');

    // Store hashed token in Redis with TTL
    const redisKey = passwordResetRedisPrefix + user.id;
    await this.cacheManager.set(redisKey, hashedToken, passwordResetRedisTTL);

    this.logger.log(`Password reset token generated for user ID: ${user.id}`);

    // Create reset link with the plain token (not hashed)
    const resetLink = `${FRONTEND_URL}/reset-password?token=${fullToken}`;

    // Send password reset email
    await this.emailService.sendEmail(
      user.email,
      'Password Reset Request',
      PasswordResetEmailTemplateHtml(resetLink, user.email),
    );

    this.logger.log(`Password reset email sent to: ${user.email}`);

    return {
      email,
      message:
        'If an account with that email exists, a password reset link has been sent',
    };
  }

  /**
   * Resets the user's password using a valid reset token.
   * Invalidates all existing sessions for security.
   * @param userId - The ID of the user resetting their password.
   * @param token - The password reset token from the email.
   * @param newPassword - The new password to set.
   * @returns A success message.
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Decrypt token to extract userId
    const userId = this.decryptPasswordResetToken(token);

    // Extract random part for Redis validation
    const [randomPart] = token.split('.');

    if (!randomPart) {
      throw new BadRequestException('Invalid reset token format');
    }

    // Verify user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, providers: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Verify user has CREDENTIAL provider
    if (!user.providers.includes(Provider.CREDENTIAL)) {
      throw new BadRequestException(
        'Password reset is not available for accounts that only use social login providers',
      );
    }

    // Get stored hashed token from Redis
    const redisKey = passwordResetRedisPrefix + userId;
    const storedHashedToken = await this.cacheManager.get<string>(redisKey);

    if (!storedHashedToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash the random part from the token and compare with stored hash
    const hashedToken = createHash('sha256').update(randomPart).digest('hex');

    if (hashedToken !== storedHashedToken) {
      this.logger.warn(`Invalid reset token attempt for user ID: ${userId}`);
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password
    await this.prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete the reset token from Redis
    await this.cacheManager.del(redisKey);

    // Invalidate all active sessions for security
    await this.logoutAll(userId);

    this.logger.log(`Password reset successfully for user ID: ${userId}`);

    // Send confirmation email
    await this.emailService.sendEmail(
      user.email,
      'Password Changed Successfully',
      PasswordResetConfirmationEmailTemplateHtml(user.email),
    );

    return {
      message:
        'Password reset successful. All sessions have been logged out for security',
    };
  }

  private async generateUniqueRefreshToken(): Promise<{
    token: string;
    hashedToken: string;
  }> {
    while (true) {
      // Generate a random token
      const token = randomBytes(64).toString('hex');

      // Hash the token
      const hashedToken = this.hashRefreshToken(token);

      // Check if the hashed token is unique
      const existingSession = await this.prisma.session.findUnique({
        where: { refreshToken: hashedToken },
      });

      if (!existingSession) {
        return { token, hashedToken };
      }

      // If not unique, repeat the process
    }
  }

  /**
   * Hashes the refresh token using SHA-256.
   * We use SHA-256 instead of bcrypt for performance reasons, as refresh tokens need to be verified frequently.
   * @param token - The plain refresh token to hash.
   * @returns The hashed refresh token.
   */
  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateVerificationCode(): number {
    // Generate a random 6-digit number between 100000 and 999999 (inclusive)
    return Math.floor(Math.random() * 900000) + 100000;
  }

  /**
   * Generates a secure password reset token with embedded userId.
   * Token format: {randomPart}.{encryptedPayload}
   * @param userId - The user ID to embed in the token
   * @returns Object containing the full token and the random part for hashing
   */
  private generatePasswordResetToken(userId: string): {
    fullToken: string;
    randomPart: string;
  } {
    // Generate 64 random bytes for the first part (128 hex characters)
    const randomPart = randomBytes(64).toString('hex');

    // Create payload with userId and timestamp
    const payload = JSON.stringify({
      userId,
      createdAt: Date.now(),
    });

    // Generate random IV (Initialization Vector) for encryption
    const iv = randomBytes(this.IV_LENGTH);

    // Encrypt the payload using AES-256-CBC
    const cipher = createCipheriv('aes-256-cbc', this.ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine IV + encrypted data and encode as base64url
    const encryptedPayload = Buffer.from(
      iv.toString('hex') + encrypted,
    ).toString('base64url');

    // Format: {randomPart}.{encryptedPayload}
    const fullToken = `${randomPart}.${encryptedPayload}`;

    return { fullToken, randomPart };
  }

  /**
   * Decrypts and validates a password reset token, extracting the userId.
   * @param token - The full password reset token
   * @returns The userId extracted from the token
   * @throws BadRequestException if token format is invalid or decryption fails
   */
  private decryptPasswordResetToken(token: string): string {
    try {
      // Split token into parts
      const parts = token.split('.');
      if (parts.length !== 2) {
        throw new BadRequestException('Invalid reset token format');
      }

      const [randomPart, encryptedPayload] = parts;

      // Validate random part length (should be 128 hex characters for 64 bytes)
      if (randomPart.length !== 128) {
        throw new BadRequestException('Invalid reset token format');
      }

      // Decode the encrypted payload
      const combined = Buffer.from(encryptedPayload, 'base64url').toString(
        'utf8',
      );

      // Extract IV (first 32 hex characters = 16 bytes)
      const ivHex = combined.slice(0, this.IV_LENGTH * 2);
      const encrypted = combined.slice(this.IV_LENGTH * 2);

      const iv = Buffer.from(ivHex, 'hex');

      // Decrypt the payload using AES-256-CBC
      const decipher = createDecipheriv('aes-256-cbc', this.ENCRYPTION_KEY, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      // Parse the payload
      const payload = JSON.parse(decrypted);

      if (!payload.userId || !payload.createdAt) {
        throw new BadRequestException('Invalid token payload');
      }

      // Optional: Add additional time-based validation
      const tokenAge = Date.now() - payload.createdAt;
      const maxAge = 30 * 60 * 1000; // 30 minutes in milliseconds

      if (tokenAge > maxAge) {
        this.logger.warn(
          `Expired token attempt for user ID: ${payload.userId}`,
        );
        throw new BadRequestException('Reset token has expired');
      }

      return payload.userId;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Failed to decrypt password reset token', error.stack);
      throw new BadRequestException('Invalid or corrupted reset token');
    }
  }

  private async generateUniqueUsername(
    defaultUsername: string,
  ): Promise<string> {
    try {
      // First, check if the default username already exists
      const isDefaultUsernameExists = await this.prisma.users.findUnique({
        where: { username: defaultUsername },
        select: { username: true },
      });

      if (!isDefaultUsernameExists) {
        // If the default username is unique, return it immediately
        return defaultUsername;
      }

      // If the default username exists, generate a batch of potential usernames
      const batchSize = 5;

      // Number suffixes to append to the default username are between 0 and 9999
      const potentialUsernames = Array.from(
        { length: batchSize },
        () => `${defaultUsername}${Math.floor(Math.random() * 10000)}`,
      );

      // Check which usernames already exist in a single query
      const existingUsernames = await this.prisma.users.findMany({
        where: { username: { in: potentialUsernames } },
        select: { username: true },
      });

      // Create a set of existing usernames for quick lookup
      const existingSet = new Set(existingUsernames.map((u) => u.username));

      // Find the first unique username
      const uniqueUsername = potentialUsernames.find(
        (username) => !existingSet.has(username),
      );

      if (uniqueUsername) {
        return uniqueUsername;
      }

      throw new BadRequestException(
        'Failed to generate a unique username. Try to provide a different one.',
      );
    } catch (error) {
      this.logger.error('Error checking username uniqueness', error);
      throw new InternalServerErrorException(
        'Could not generate a unique username',
      );
    }
  }
}
