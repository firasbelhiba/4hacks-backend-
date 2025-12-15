import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  SearchUsersQueryDto,
  PaginatedPublicUsersDto,
  PublicUserDto,
} from './dto/search-users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Search users by username, email, or name (public endpoint).
   * Returns only public user information: id, name, email, username, image.
   * Excludes banned users.
   * @param query - Query parameters for search and pagination.
   * @returns Paginated list of public user information.
   */
  async searchUsers(
    query: SearchUsersQueryDto,
  ): Promise<PaginatedPublicUsersDto> {
    const { search, page = 1, limit = 10 } = query;

    // Build where clause - exclude banned users and add search if provided
    const where: Prisma.usersWhereInput = {
      isBanned: false, // Only return non-banned users
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: data as PublicUserDto[],
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
