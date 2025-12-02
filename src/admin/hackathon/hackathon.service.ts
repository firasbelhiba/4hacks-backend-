import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { HackathonStatus } from 'generated/prisma';
import { CancelHackathonDto } from './dto/cancel-hackathon.dto';
import { HackathonCancelledEmailTemplateHtml } from 'src/common/templates/emails.templates.list';

@Injectable()
export class AdminHackathonService {
  private readonly logger = new Logger(AdminHackathonService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Cancel a hackathon (admin only).
   * Only hackathons in DRAFT or ACTIVE status can be cancelled.
   * Sends email notification to the organization owner.
   * @param identifier - Hackathon ID or slug
   * @param adminId - ID of the admin performing the cancellation
   * @param cancelDto - Contains the reason for cancellation
   * @returns The cancelled hackathon
   */
  async cancelHackathon(
    identifier: string,
    adminId: string,
    cancelDto: CancelHackathonDto,
  ) {
    // Find hackathon by ID or slug
    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if hackathon can be cancelled
    if (hackathon.status === HackathonStatus.CANCELLED) {
      throw new BadRequestException('Hackathon is already cancelled');
    }

    if (hackathon.status === HackathonStatus.ARCHIVED) {
      throw new BadRequestException(
        'Cannot cancel an archived hackathon. Archived hackathons have already been completed.',
      );
    }

    // Cancel the hackathon
    const cancelledHackathon = await this.prisma.hackathon.update({
      where: { id: hackathon.id },
      data: {
        status: HackathonStatus.CANCELLED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(
      `Hackathon ${hackathon.id} (${hackathon.title}) cancelled by admin ${adminId}. Reason: ${cancelDto.reason}`,
    );

    // Send email notification to organization owner
    try {
      const emailHtml = HackathonCancelledEmailTemplateHtml(
        hackathon.organization.owner.name || 'Organization Owner',
        hackathon.title,
        hackathon.slug,
        hackathon.organization.name,
        cancelDto.reason,
      );

      await this.emailService.sendEmail(
        hackathon.organization.owner.email,
        `⚠️ Your Hackathon "${hackathon.title}" Has Been Cancelled`,
        emailHtml,
      );

      this.logger.log(
        `Cancellation email sent to ${hackathon.organization.owner.email} for hackathon: ${hackathon.title}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send cancellation email to ${hackathon.organization.owner.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      // Don't throw error - email failure shouldn't fail the cancellation
    }

    return {
      message: 'Hackathon cancelled successfully',
      data: cancelledHackathon,
    };
  }
}

