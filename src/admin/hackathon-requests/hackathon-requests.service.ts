import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryHackathonRequestsDto } from './dto/query-hackathon-requests.dto';
import { PaginatedHackathonRequestsDto } from './dto/paginated-hackathon-requests.dto';
import {
  Prisma,
  RequestStatus,
  HackathonStatus,
  HackathonType,
} from 'generated/prisma';
import { EmailService } from 'src/email/email.service';
import {
  HackathonRequestApprovedEmailTemplateHtml,
  HackathonRequestRejectedEmailTemplateHtml,
} from 'src/common/templates/emails.templates.list';

@Injectable()
export class HackathonRequestsService {
  private readonly logger = new Logger(HackathonRequestsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(
    query: QueryHackathonRequestsDto,
  ): Promise<PaginatedHackathonRequestsDto> {
    const {
      page = 1,
      limit = 10,
      status,
      organizationId,
      search,
      startDateFrom,
      startDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build where clause for filtering
    const where: Prisma.HackathonCreationRequestWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (search) {
      where.hackTitle = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy clause for sorting
    const orderBy: Prisma.HackathonCreationRequestOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.hackathonCreationRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          hackathon: true,
          approvedBy: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
          rejectedBy: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.hackathonCreationRequest.count({ where }),
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

  async approveRequest(requestId: string, adminId: string) {
    // Fetch the request with organization details
    const request = await this.prisma.hackathonCreationRequest.findUnique({
      where: { id: requestId },
      include: {
        organization: true,
        hackathon: true,
      },
    });

    // Validate request exists
    if (!request) {
      throw new NotFoundException(
        `Hackathon request with ID ${requestId} not found`,
      );
    }

    // Validate request status
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve request with status: ${request.status}. Only PENDING requests can be approved.`,
      );
    }

    // Check if hackathon already exists
    if (request.hackathon) {
      throw new ConflictException(
        `This request has already been approved and a hackathon has been created`,
      );
    }

    // Check if slug is already in use
    const existingHackathon = await this.prisma.hackathon.findUnique({
      where: { slug: request.hackSlug },
    });

    if (existingHackathon) {
      throw new ConflictException(
        `A hackathon with slug '${request.hackSlug}' already exists`,
      );
    }

    // Use a transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the hackathon
      const hackathon = await tx.hackathon.create({
        data: {
          title: request.hackTitle,
          slug: request.hackSlug,
          description: `${request.focus}\n\nTarget Audience: ${request.audience}`,
          location:
            request.hackType !== HackathonType.ONLINE
              ? [
                  request.hackAddress,
                  request.hackCity,
                  request.hackState,
                  request.hackCountry,
                ]
                  .filter(Boolean)
                  .join(', ')
              : Prisma.JsonNull,
          category: request.hackCategory,
          type: request.hackType,
          status: HackathonStatus.DRAFT,
          prizePool: request.prizePool,
          prizeToken: request.prizeToken,
          registrationStart: request.registrationStart,
          registrationEnd: request.registrationEnd,
          startDate: request.startDate,
          endDate: request.endDate,
          judgingStart: request.judgingStart,
          judgingEnd: request.judgingEnd,
          organizationId: request.organizationId,
        },
      });

      // Create the default hackathon track
      await tx.track.create({
        data: {
          name: 'Main Track',
          description: 'Default hackathon track',
          hackathonId: hackathon.id,
        },
      });

      // Create teh default sponsor entry for the hackathon organization
      await tx.sponsor.create({
        data: {
          name: request.organization.name,
          logo: request.organization.logo,
          hackathonId: hackathon.id,
          isCurrentOrganization: true,
        },
      });

      // Update the request status
      const updatedRequest = await tx.hackathonCreationRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.APPROVED,
          approvedById: adminId,
          approvedAt: new Date(),
          hackId: hackathon.id,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          hackathon: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return updatedRequest;
    });

    // Send email notification to organization owner
    try {
      const formattedStartDate = new Date(result.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedEndDate = new Date(result.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const emailHtml = HackathonRequestApprovedEmailTemplateHtml(
        result.organization.owner.name,
        result.hackTitle,
        result.hackSlug,
        result.organization.name,
        formattedStartDate,
        formattedEndDate,
        result.prizePool,
        result.prizeToken,
      );

      await this.emailService.sendEmail(
        result.organization.owner.email,
        `🎉 Your Hackathon "${result.hackTitle}" Has Been Approved!`,
        emailHtml,
      );

      this.logger.log(
        `Approval email sent to ${result.organization.owner.email} for hackathon: ${result.hackTitle}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send approval email to ${result.organization.owner.email}`,
        error.stack,
      );
      // Don't throw error - email failure shouldn't fail the approval
    }

    return {
      message: 'Request approved successfully and hackathon created',
      data: result,
    };
  }

  async rejectRequest(
    requestId: string,
    adminId: string,
    rejectionReason: string,
  ) {
    // Fetch the request
    const request = await this.prisma.hackathonCreationRequest.findUnique({
      where: { id: requestId },
    });

    // Validate request exists
    if (!request) {
      throw new NotFoundException(
        `Hackathon request with ID ${requestId} not found`,
      );
    }

    // Validate request status
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject request with status: ${request.status}. Only PENDING requests can be rejected.`,
      );
    }

    // Update the request status
    const updatedRequest = await this.prisma.hackathonCreationRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        rejectedById: adminId,
        rejectedAt: new Date(),
        rejectedReason: rejectionReason,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
              },
            },
          },
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        rejectedBy: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Send email notification to organization owner
    try {
      const formattedStartDate = new Date(updatedRequest.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedEndDate = new Date(updatedRequest.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const emailHtml = HackathonRequestRejectedEmailTemplateHtml(
        updatedRequest.organization.owner.name,
        updatedRequest.hackTitle,
        updatedRequest.organization.name,
        rejectionReason,
        formattedStartDate,
        formattedEndDate,
      );

      await this.emailService.sendEmail(
        updatedRequest.organization.owner.email,
        `Hackathon Request Update: "${updatedRequest.hackTitle}"`,
        emailHtml,
      );

      this.logger.log(
        `Rejection email sent to ${updatedRequest.organization.owner.email} for hackathon: ${updatedRequest.hackTitle}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send rejection email to ${updatedRequest.organization.owner.email}`,
        error.stack,
      );
      // Don't throw error - email failure shouldn't fail the rejection
    }

    return {
      message: 'Request rejected successfully',
      data: updatedRequest,
    };
  }
}
