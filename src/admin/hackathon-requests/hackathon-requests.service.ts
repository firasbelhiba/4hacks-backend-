import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryHackathonRequestsDto } from './dto/query-hackathon-requests.dto';
import { PaginatedHackathonRequestsDto } from './dto/paginated-hackathon-requests.dto';
import { Prisma } from 'generated/prisma';

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
}
