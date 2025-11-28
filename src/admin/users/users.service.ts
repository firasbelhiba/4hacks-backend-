import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { SessionStatus, UserRole } from 'generated/prisma';
import { BanUserDto } from './dto/ban-user.dto';
import { AccountBannedEmailTemplateHtml } from 'src/common/templates/emails.templates.list';

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
   * @param banDto - Contains the reason for the ban.
   * @returns A success message with ban details.
   */
  async banUser(userId: string, adminId: string, banDto: BanUserDto) {
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
          bannedReason: banDto.reason,
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
        AccountBannedEmailTemplateHtml(user.email, banDto.reason),
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
      `User ${userId} banned by admin ${adminId}. Reason: ${banDto.reason}`,
    );

    return {
      message: 'User has been banned successfully',
      userId,
      bannedAt,
      reason: banDto.reason,
    };
  }
}

