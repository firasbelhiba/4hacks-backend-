import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SearchUsersQueryDto, PublicUserDto } from './dto/search-users.dto';
import { SEARCH_USERS_LIMIT } from './constants';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Search users by username, email, or name (public endpoint).
   * Returns only public user information: id, name, email, username, image.
   * Excludes banned users.
   * Returns the first 10 results.
   * @param query - Query parameters for search.
   * @returns List of public user information (max 10 results).
   */
  async searchUsers(query: SearchUsersQueryDto): Promise<PublicUserDto[]> {
    const { search } = query;

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

    // Execute query with limit from constants
    const data = await this.prisma.users.findMany({
      where,
      take: SEARCH_USERS_LIMIT,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
      },
    });

    return data as PublicUserDto[];
  }
}
