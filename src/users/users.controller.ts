import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SearchUsersQueryDto, PublicUserDto } from './dto/search-users.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Search users by username, email, or name',
    description:
      'Public endpoint to search for users by username, email, or name. Returns only public user information: id, name, email, username, and image. Banned users are excluded from results. Returns the first 10 matching results.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query to match against user name, email, or username',
    example: 'john',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users matching the search criteria (max 10 results)',
    type: [PublicUserDto],
  })
  @Get()
  async searchUsers(
    @Query() query: SearchUsersQueryDto,
  ): Promise<PublicUserDto[]> {
    return await this.usersService.searchUsers(query);
  }
}
