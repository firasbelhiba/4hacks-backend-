import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
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

@Injectable()
export class HackathonRequestsService {
  constructor(private prisma: PrismaService) {}

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
              : null,
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
          hackathon: false,
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

      return { request: updatedRequest, hackathon };
    });

    return result;
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
        hackathon: true,
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

    return updatedRequest;
  }
}
