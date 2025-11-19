import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { randomBytes } from 'crypto';
import { authCookiesNames, refreshTokenConstants } from './constants';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

  async login(loginDto: LoginDto, res: Response) {
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

    const newSession = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        expiresAt: refreshTokenExpiration,
      },
      select: { id: true },
    });

    // Set refresh token as HttpOnly cookie
    res.cookie(authCookiesNames.refreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenConstants.expirationSeconds * 1000,
    });

    // Set Session ID cookie as HttpOnly cookie
    res.cookie(authCookiesNames.sessionId, newSession.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenConstants.expirationSeconds * 1000,
    });

    this.logger.log(`User logged in: ${user.email}`);

    return res.json({
      message: 'User logged in successfully',
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  }

  async refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies[authCookiesNames.refreshToken];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token cookie is missing');
    }

    const sessionId = req.cookies[authCookiesNames.sessionId];

    if (!sessionId) {
      throw new BadRequestException('Session cookie ID is missing');
    }

    // get session by ID
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify refresh token expiration
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Verify refresh token validity
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      session.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
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

    // Update refresh token in the HttpOnly cookie
    res.cookie(authCookiesNames.refreshToken, newPlainRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenConstants.expirationSeconds * 1000,
    });

    // Renew Session ID cookie as HttpOnly cookie with same session ID (renew happens to avoid expiration of the cookie)
    res.cookie(authCookiesNames.sessionId, session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenConstants.expirationSeconds * 1000,
    });

    this.logger.log(`Refresh token rotated for user: ${user.email}`);

    return res.json({
      message: 'Access token refreshed successfully',
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  }

  private async generateUniqueRefreshToken(): Promise<{
    token: string;
    hashedToken: string;
  }> {
    const token = randomBytes(64).toString('hex');

    const hashedToken = await bcrypt.hash(token, 12);

    return { token, hashedToken };
  }
}
