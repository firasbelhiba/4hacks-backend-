import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HackathonFaqService } from './hackathon-faq.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { QueryThreadsDto } from './dto/query-threads.dto';
import { QueryThreadDto } from './dto/query-thread.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { HackathonMin, UserMin } from 'src/common/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { HackathonContextGuard } from '../guards/hackathon.guard';
import { Hackathon } from '../decorators/hackathon.decorator';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';

@ApiParam({
  name: 'hackathonId',
  description: 'ID of the hackathon',
  required: true,
  type: 'string',
})
@ApiTags('Hackathon FAQ / Q&A')
@Controller('hackathon/:hackathonId/questions')
export class HackathonFaqController {
  constructor(private readonly hackathonFaqService: HackathonFaqService) {}

  @ApiOperation({
    summary: 'Create a new question thread',
    description:
      'Create a new question thread for a hackathon. For public hackathons, any authenticated user can post. For private hackathons, only registered (approved) users, organizer, or admin can post.',
  })
  @ApiResponse({
    status: 201,
    description: 'Question thread created successfully',
    example: {
      message: 'Question thread created successfully',
      thread: {
        id: 'cuid',
        hackathonId: 'cuid',
        userId: 'cuid',
        title: 'Can we use Layer 2 solutions?',
        content: 'I want to know if we can deploy on Arbitrum...',
        attachments: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        user: {
          id: 'cuid',
          name: 'John Doe',
          username: 'johndoe',
          image: 'https://example.com/image.png',
        },
        repliesCount: 0,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Must be authenticated',
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden - For private hackathons, must be registered and approved',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Post()
  async createThread(
    @Body() createThreadDto: CreateThreadDto,
    @CurrentUser() user: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.hackathonFaqService.createThread(
      hackathon,
      createThreadDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Get all question threads for a hackathon',
    description:
      'Get a paginated list of all question threads for a hackathon. For public hackathons, anyone can view. For private hackathons, only registered (approved) users, organizer, or admin can view.',
  })
  @ApiResponse({
    status: 200,
    description: 'Question threads retrieved successfully',
    example: {
      threads: [
        {
          id: 'cuid',
          hackathonId: 'cuid',
          userId: 'cuid',
          title: 'Can we use Layer 2 solutions?',
          content: 'I want to know if we can deploy...',
          attachments: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 'cuid',
            name: 'John Doe',
            username: 'johndoe',
            image: 'https://example.com/image.png',
          },
          repliesCount: 3,
          lastReplyAt: '2024-01-02T00:00:00.000Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    },
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden - For private hackathons, must be registered and approved',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard, HackathonContextGuard)
  @Get()
  async getThreads(
    @Query() query: QueryThreadsDto,
    @Hackathon() hackathon: HackathonMin,
    @CurrentUser() user?: UserMin,
  ) {
    return await this.hackathonFaqService.getThreads(hackathon, query, user);
  }

  @ApiOperation({
    summary: 'Get a specific question thread with paginated replies',
    description:
      'Get a specific question thread by ID with its replies as a flat list. Replies include `parentId` field for building tree structure on the frontend. Replies are paginated for performance. Use `repliesLimit` (default: 50, max: 500) and `repliesOffset` (default: 0) for pagination. For "load more" functionality: 1) Frontend maintains a local flat list of all fetched replies, 2) On "load more", fetch next batch with incremented offset, 3) Append to local list, 4) Rebuild tree from complete local list. For public hackathons, anyone can view. For private hackathons, only registered (approved) users, organizer, or admin can view.',
  })
  @ApiParam({
    name: 'threadId',
    description: 'ID of the question thread',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Question thread retrieved successfully',
    example: {
      id: 'cuid',
      hackathonId: 'cuid',
      userId: 'cuid',
      title: 'Can we use Layer 2 solutions?',
      content: 'I want to know if we can deploy...',
      attachments: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      user: {
        id: 'cuid',
        name: 'John Doe',
        username: 'johndoe',
        image: 'https://example.com/image.png',
      },
      replies: [
        {
          id: 'reply-1',
          threadId: 'cuid',
          userId: 'cuid',
          parentId: null,
          content: 'Yes, you can use any EVM-compatible chain!',
          attachments: [],
          createdAt: '2024-01-01T12:00:00.000Z',
          updatedAt: '2024-01-01T12:00:00.000Z',
          user: {
            id: 'cuid',
            name: 'Organizer',
            username: 'organizer',
            image: 'https://example.com/organizer.png',
          },
        },
        {
          id: 'reply-2',
          threadId: 'cuid',
          userId: 'cuid',
          parentId: 'reply-1',
          content: 'Thanks for the info!',
          attachments: [],
          createdAt: '2024-01-01T13:00:00.000Z',
          updatedAt: '2024-01-01T13:00:00.000Z',
          user: {
            id: 'cuid',
            name: 'John Doe',
            username: 'johndoe',
            image: 'https://example.com/image.png',
          },
        },
        {
          id: 'reply-3',
          threadId: 'cuid',
          userId: 'cuid',
          parentId: 'reply-2',
          content: 'You are welcome!',
          attachments: [],
          createdAt: '2024-01-01T14:00:00.000Z',
          updatedAt: '2024-01-01T14:00:00.000Z',
          user: {
            id: 'cuid',
            name: 'Organizer',
            username: 'organizer',
            image: 'https://example.com/organizer.png',
          },
        },
      ],
      repliesCount: 3,
      totalReplies: 3,
      hasMoreReplies: false,
      repliesPagination: {
        limit: 50,
        offset: 0,
        total: 3,
        hasMore: false,
      },
    },
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden - For private hackathons, must be registered and approved',
  })
  @ApiNotFoundResponse({
    description: 'Thread or hackathon not found',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard, HackathonContextGuard)
  @Get(':threadId')
  async getThreadById(
    @Param('threadId') threadId: string,
    @Query() query: QueryThreadDto,
    @Hackathon() hackathon: HackathonMin,
    @CurrentUser() user?: UserMin,
  ) {
    return await this.hackathonFaqService.getThreadById(
      hackathon,
      threadId,
      query,
      user,
    );
  }

  @ApiOperation({
    summary: 'Create a reply to a question thread',
    description:
      'Create a reply to a question thread. Can be a direct reply to the thread or a nested reply to another reply. For public hackathons, any authenticated user can reply. For private hackathons, only registered (approved) users, organizer, or admin can reply.',
  })
  @ApiParam({
    name: 'threadId',
    description: 'ID of the question thread',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Reply created successfully',
    example: {
      message: 'Reply created successfully',
      reply: {
        id: 'cuid',
        threadId: 'cuid',
        userId: 'cuid',
        parentId: null,
        content: 'Yes, you can use any EVM-compatible chain!',
        attachments: [],
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
        user: {
          id: 'cuid',
          name: 'Organizer',
          username: 'organizer',
          image: 'https://example.com/organizer.png',
        },
        parent: null,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Must be authenticated',
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden - For private hackathons, must be registered and approved',
  })
  @ApiNotFoundResponse({
    description: 'Thread or parent reply not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Post(':threadId/replies')
  async createReply(
    @Param('threadId') threadId: string,
    @Body() createReplyDto: CreateReplyDto,
    @CurrentUser() user: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.hackathonFaqService.createReply(
      hackathon,
      threadId,
      createReplyDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Update a question thread',
    description:
      'Update a question thread. Only the thread creator can update their own content. All fields are optional - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'threadId',
    description: 'ID of the question thread to update',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Thread updated successfully',
    example: {
      message: 'Thread updated successfully',
      thread: {
        id: 'cuid',
        hackathonId: 'cuid',
        userId: 'cuid',
        title: 'Updated title',
        content: 'Updated content',
        attachments: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        user: {
          id: 'cuid',
          name: 'John Doe',
          username: 'johndoe',
          image: 'https://example.com/image.png',
        },
        repliesCount: 3,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Must be authenticated',
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden - Only the thread creator can update their own content',
  })
  @ApiNotFoundResponse({
    description: 'Thread not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Patch(':threadId')
  async updateThread(
    @Param('threadId') threadId: string,
    @Body() updateThreadDto: UpdateThreadDto,
    @CurrentUser() user: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.hackathonFaqService.updateThread(
      hackathon,
      threadId,
      updateThreadDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Update a reply',
    description:
      'Update a reply. Only the reply creator can update their own content. All fields are optional - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'threadId',
    description: 'ID of the question thread',
    required: true,
    type: 'string',
  })
  @ApiParam({
    name: 'replyId',
    description: 'ID of the reply to update',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Reply updated successfully',
    example: {
      message: 'Reply updated successfully',
      reply: {
        id: 'cuid',
        threadId: 'cuid',
        userId: 'cuid',
        parentId: null,
        content: 'Updated reply content',
        attachments: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        user: {
          id: 'cuid',
          name: 'John Doe',
          username: 'johndoe',
          image: 'https://example.com/image.png',
        },
        parent: null,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Must be authenticated',
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden - Only the reply creator can update their own content',
  })
  @ApiNotFoundResponse({
    description: 'Thread or reply not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Patch(':threadId/replies/:replyId')
  async updateReply(
    @Param('threadId') threadId: string,
    @Param('replyId') replyId: string,
    @Body() updateReplyDto: UpdateReplyDto,
    @CurrentUser() user: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.hackathonFaqService.updateReply(
      hackathon,
      threadId,
      replyId,
      updateReplyDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Delete a question thread',
    description:
      'Delete a question thread. Only the thread creator, hackathon organizer, or admin can delete. Deleting a thread will also delete all its replies (cascade delete).',
  })
  @ApiParam({
    name: 'threadId',
    description: 'ID of the question thread to delete',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Thread deleted successfully',
    example: {
      message: 'Thread deleted successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Must be authenticated',
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden - Only thread creator, organizer, or admin can delete',
  })
  @ApiNotFoundResponse({
    description: 'Thread not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Delete(':threadId')
  async deleteThread(
    @Param('threadId') threadId: string,
    @CurrentUser() user: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.hackathonFaqService.deleteThread(
      hackathon,
      threadId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Delete a reply',
    description:
      'Delete a reply. Only the reply creator, hackathon organizer, or admin can delete. Deleting a reply will also delete all its nested replies (cascade delete).',
  })
  @ApiParam({
    name: 'threadId',
    description: 'ID of the question thread',
    required: true,
    type: 'string',
  })
  @ApiParam({
    name: 'replyId',
    description: 'ID of the reply to delete',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Reply deleted successfully',
    example: {
      message: 'Reply deleted successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Must be authenticated',
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden - Only reply creator, organizer, or admin can delete',
  })
  @ApiNotFoundResponse({
    description: 'Thread or reply not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Delete(':threadId/replies/:replyId')
  async deleteReply(
    @Param('threadId') threadId: string,
    @Param('replyId') replyId: string,
    @CurrentUser() user: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.hackathonFaqService.deleteReply(
      hackathon,
      threadId,
      replyId,
      user,
    );
  }
}
