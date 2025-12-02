import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { SessionStatus, UserRole, Prisma } from 'generated/prisma';
import { ManageUserBanDto } from './dto/manage-user-ban.dto';
import {
  AccountBannedEmailTemplateHtml,
  AccountUnbannedEmailTemplateHtml,
} from 'src/common/templates/emails.templates.list';
import {
  QueryUsersDto,
  PaginatedUsersDto,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Bans a user account (admin only).
   * Revokes all active sessions and sends email notification to the banned user.
   * @param userId - The ID of the user to ban.
   * @param adminId - The ID of the admin performing the ban.
   * @param manageDto - Contains the reason for the ban.
   * @returns A success message with ban details.
   */
  async banUser(userId: string, adminId: string, manageDto: ManageUserBanDto) {
    // Check if user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already banned
    if (user.isBanned) {
      throw new BadRequestException('User is already banned');
    }

    // Prevent admins from banning other admins
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot ban another administrator');
    }

    const bannedAt = new Date();

    // Update account and revoke all sessions
    await this.prisma.$transaction([
      this.prisma.users.update({
        where: { id: userId },
        data: {
          isBanned: true,
          bannedAt: bannedAt,
          bannedReason: manageDto.reason || null,
        },
      }),
      this.prisma.session.updateMany({
        where: { userId, status: SessionStatus.ACTIVE },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: bannedAt,
          revokedById: adminId, // Track which admin banned the user
        },
      }),
    ]);

    // Send email notification to banned user
    try {
      await this.emailService.sendEmail(
        user.email,
        'Account Banned',
        AccountBannedEmailTemplateHtml(
          user.email,
          manageDto.reason || 'No reason provided',
        ),
      );
    } catch (error) {
      // Log error but don't fail the ban operation
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send ban notification email to ${user.email}: ${errorMessage}`,
      );
    }

    this.logger.log(
      `User ${userId} banned by admin ${adminId}.${manageDto?.reason ? ` Reason: ${manageDto.reason}` : ' No reason provided'}`,
    );

    return {
      message: 'User has been banned successfully',
      userId,
      bannedAt,
      reason: manageDto.reason || null,
    };
  }

  /**
   * Unbans a user account (admin only).
   * Sends email notification to the unbanned user.
   * @param userId - The ID of the user to unban.
   * @param adminId - The ID of the admin performing the unban.
   * @param manageDto - Optional reason for the unban (for logging).
   * @returns A success message with unban details.
   */
  async unbanUser(userId: string, adminId: string, manageDto?: ManageUserBanDto) {
    // Check if user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is actually banned
    if (!user.isBanned) {
      throw new BadRequestException('User is not banned');
    }

    // Prevent admins from unbanning other admins
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot unban another administrator');
    }

    // Update account (keep bannedAt and bannedReason for history)
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        isBanned: false,
      },
    });

    // Send email notification to unbanned user
    try {
      await this.emailService.sendEmail(
        user.email,
        'Account Unbanned',
        AccountUnbannedEmailTemplateHtml(user.email),
      );
    } catch (error) {
      // Log error but don't fail the unban operation
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send unban notification email to ${user.email}: ${errorMessage}`,
      );
    }

    this.logger.log(
      `User ${userId} unbanned by admin ${adminId}.${manageDto?.reason ? ` Reason: ${manageDto.reason}` : ''}`,
    );

    return {
      message: 'User has been unbanned successfully',
      userId,
      unbannedAt: new Date(),
      reason: manageDto?.reason || null,
    };
  }

  /**
   * Gets all users with pagination, filtering, and sorting (admin only).
   * @param query - Query parameters for pagination, filtering, and sorting.
   * @returns Paginated list of users.
   */
  async findAll(query: QueryUsersDto): Promise<PaginatedUsersDto> {
    const {
      page = 1,
      limit = 10,
      isBanned,
      role,
      emailVerified,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build where clause for filtering
    const where: Prisma.usersWhereInput = {};

    if (isBanned !== undefined) {
      where.isBanned = isBanned;
    }

    if (role) {
      where.role = role;
    }

    if (emailVerified !== undefined) {
      where.isEmailVerified = emailVerified;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy clause for sorting
    const orderBy: Prisma.usersOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          image: true,
          isBanned: true,
          bannedAt: true,
          bannedReason: true,
          isEmailVerified: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
}

