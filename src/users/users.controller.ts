import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  SearchUsersQueryDto,
  PaginatedPublicUsersDto,
} from './dto/search-users.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Search users by username, email, or name',
    description:
      'Public endpoint to search for users by username, email, or name. Returns only public user information: id, name, email, username, and image. Banned users are excluded from results.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query to match against user name, email, or username',
    example: 'john',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-indexed)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of users matching the search criteria',
    type: PaginatedPublicUsersDto,
  })
  @Get()
  async searchUsers(
    @Query() query: SearchUsersQueryDto,
  ): Promise<PaginatedPublicUsersDto> {
    return await this.usersService.searchUsers(query);
  }
}
