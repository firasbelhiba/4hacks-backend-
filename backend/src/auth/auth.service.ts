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
import { SessionStatus, UserRole } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { createHash, randomBytes } from 'crypto';
import {
  refreshTokenConstants,
  verifyEmailRedisPrefix,
  verifyEmailRedisTTL,
} from './constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto) {
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
    const username = usernameBody
      ? usernameBody.toLowerCase()
      : email.split('@')[0].toLowerCase();

    // Check if the generated username is unique
    const isUsernameExists = await this.prisma.users.findUnique({
      where: { username },
    });

    if (isUsernameExists) {
      throw new ConflictException(
        'Username already exists. Please Provide another one.',
      );
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
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
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
          },
        });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
      },
      select: { id: true },
    });

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
    await this.cacheManager.set(
      'email_verification_test',
      'success',
      verifyEmailRedisTTL,
    );

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

    const redisCacheStore = await this.getRedisCacheStore();

    const isSetSuccess = await redisCacheStore.set(
      redisKey,
      verificationCode,
      verifyEmailRedisTTL,
    );

    if (!isSetSuccess) {
      throw new InternalServerErrorException(
        'Failed to store verification code in Redis',
      );
    }

    this.logger.log(
      `Verification code ${verificationCode} stored in Redis for user ID: ${user.id}`,
    );

    // TODO: Send the verification code via email using an email service

    return {
      email: user.email,
      message: 'Verification email sent successfully',
    };
  }

  //// Helper Methods ////

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

  private async getRedisCacheStore() {
    const allStores = this.cacheManager.stores;

    if (allStores.length === 0) {
      throw new InternalServerErrorException('No cache stores available');
    }

    this.logger.log('All Stores Length: ' + allStores.length);
    this.logger.log('All cache stores: ' + JSON.stringify(allStores));

    return allStores[0];
  }
}
