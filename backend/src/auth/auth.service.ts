import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from 'generated/prisma';
import * as bcrypt from 'bcrypt';

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
}
