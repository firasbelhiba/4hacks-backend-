import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { QueryThreadsDto } from './dto/query-threads.dto';
import { HackathonMin, UserMin } from 'src/common/types';
import {
  HackathonRegistrationStatus,
  UserRole,
} from '@prisma/client';

@Injectable()
export class HackathonFaqService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Check if user has access to view/create questions for a hackathon
   * - Public hackathons: Anyone can view, authenticated users can create
   * - Private hackathons: Only registered (approved) users + organizer + admin
   */
  private async checkHackathonAccess(
    hackathon: HackathonMin,
    user?: UserMin,
    requireWrite: boolean = false,
  ): Promise<void> {
    const isAdmin = user?.role === UserRole.ADMIN;
    const isOwner = user?.id === hackathon.organization.ownerId;
    const hasSpecialAccess = isAdmin || isOwner;

    // For private hackathons, check registration
    if (hackathon.isPrivate) {
      if (!user) {
        throw new ForbiddenException(
          'You must be authenticated to access this private hackathon',
        );
      }

      if (!hasSpecialAccess) {
        // Check if user is registered and approved
        const registration =
          await this.prismaService.hackathonRegistration.findUnique({
            where: {
              hackathonId_userId: {
                hackathonId: hackathon.id,
                userId: user.id,
              },
            },
            select: {
              status: true,
            },
          });

        if (
          !registration ||
          registration.status !== HackathonRegistrationStatus.APPROVED
        ) {
          throw new ForbiddenException(
            'You must be registered and approved to access this private hackathon',
          );
        }
      }
    } else {
      // Public hackathon - for write operations, user must be authenticated
      if (requireWrite && !user) {
        throw new ForbiddenException(
          'You must be authenticated to create questions or replies',
        );
      }
    }
  }

  /**
   * Check if user can delete a thread/reply
   * - Creator can delete their own content
   * - Organizer and Admin can delete any content (for moderation)
   */
  private canDelete(
    creatorUserId: string,
    hackathon: HackathonMin,
    user: UserMin,
  ): boolean {
    const isAdmin = user.role === UserRole.ADMIN;
    const isOwner = user.id === hackathon.organization.ownerId;
    const isCreator = user.id === creatorUserId;

    return isAdmin || isOwner || isCreator;
  }

  /**
   * Check if user can edit a thread/reply
   * - Only the creator can edit their own content
   * - Organizers and Admins cannot edit others' content (they can only delete for moderation)
   */
  private canEdit(creatorUserId: string, user: UserMin): boolean {
    return user.id === creatorUserId;
  }

  async createThread(
    hackathon: HackathonMin,
    createThreadDto: CreateThreadDto,
    user: UserMin,
  ) {
    // Check access
    await this.checkHackathonAccess(hackathon, user, true);

    const thread = await this.prismaService.hackathonQuestionThread.create({
      data: {
        hackathonId: hackathon.id,
        userId: user.id,
        title: createThreadDto.title,
        content: createThreadDto.content,
        attachments: createThreadDto.attachments || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
      },
    });

    return {
      message: 'Question thread created successfully',
      thread: {
        ...thread,
        repliesCount: thread.replies.length,
        replies: undefined, // Don't include replies in list view
      },
    };
  }

  async getThreads(
    hackathon: HackathonMin,
    query: QueryThreadsDto,
    user?: UserMin,
  ) {
    // Check access (read-only)
    await this.checkHackathonAccess(hackathon, user, false);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prismaService.hackathonQuestionThread.count({
      where: {
        hackathonId: hackathon.id,
      },
    });

    // Get threads with reply counts
    const threads = await this.prismaService.hackathonQuestionThread.findMany({
      where: {
        hackathonId: hackathon.id,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        replies: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get only the latest reply for "lastActivity" info
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return {
      threads: threads.map((thread) => ({
        id: thread.id,
        hackathonId: thread.hackathonId,
        userId: thread.userId,
        title: thread.title,
        content: thread.content,
        attachments: thread.attachments,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        user: thread.user,
        repliesCount: thread._count.replies,
        lastReplyAt:
          thread.replies.length > 0 ? thread.replies[0].createdAt : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getThreadById(
    hackathon: HackathonMin,
    threadId: string,
    user?: UserMin,
  ) {
    // Check access
    await this.checkHackathonAccess(hackathon, user, false);

    const thread = await this.prismaService.hackathonQuestionThread.findUnique({
      where: {
        id: threadId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            parent: {
              select: {
                id: true,
                userId: true,
                content: true,
              },
            },
            children: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.hackathonId !== hackathon.id) {
      throw new BadRequestException(
        "Thread doesn't belong to this hackathon",
      );
    }

    // Build nested reply structure
    const buildReplyTree = (replies: any[]) => {
      const replyMap = new Map();
      const rootReplies: any[] = [];

      // First pass: create map of all replies
      replies.forEach((reply) => {
        replyMap.set(reply.id, {
          ...reply,
          children: [],
        });
      });

      // Second pass: build tree structure
      replies.forEach((reply) => {
        const replyNode = replyMap.get(reply.id);
        if (reply.parentId) {
          const parent = replyMap.get(reply.parentId);
          if (parent) {
            parent.children.push(replyNode);
          } else {
            // Parent not found, treat as root (shouldn't happen, but handle gracefully)
            rootReplies.push(replyNode);
          }
        } else {
          rootReplies.push(replyNode);
        }
      });

      return rootReplies;
    };

    return {
      ...thread,
      replies: buildReplyTree(thread.replies),
      repliesCount: thread.replies.length,
    };
  }

  async createReply(
    hackathon: HackathonMin,
    threadId: string,
    createReplyDto: CreateReplyDto,
    user: UserMin,
  ) {
    // Check access
    await this.checkHackathonAccess(hackathon, user, true);

    // Verify thread exists and belongs to hackathon
    const thread = await this.prismaService.hackathonQuestionThread.findUnique({
      where: {
        id: threadId,
      },
      select: {
        id: true,
        hackathonId: true,
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.hackathonId !== hackathon.id) {
      throw new BadRequestException(
        "Thread doesn't belong to this hackathon",
      );
    }

    // Normalize parentId: convert empty string to null
    const parentId = createReplyDto.parentId?.trim() || null;

    // If parentId is provided, verify it exists and belongs to the same thread
    if (parentId) {
      const parentReply =
        await this.prismaService.hackathonQuestionReply.findUnique({
          where: {
            id: parentId,
          },
          select: {
            id: true,
            threadId: true,
          },
        });

      if (!parentReply) {
        throw new NotFoundException('Parent reply not found');
      }

      if (parentReply.threadId !== threadId) {
        throw new BadRequestException(
          "Parent reply doesn't belong to this thread",
        );
      }
    }

    const reply = await this.prismaService.hackathonQuestionReply.create({
      data: {
        threadId,
        userId: user.id,
        parentId: parentId,
        content: createReplyDto.content,
        attachments: createReplyDto.attachments || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        parent: {
          select: {
            id: true,
            userId: true,
            content: true,
          },
        },
      },
    });

    return {
      message: 'Reply created successfully',
      reply,
    };
  }

  async updateThread(
    hackathon: HackathonMin,
    threadId: string,
    updateThreadDto: UpdateThreadDto,
    user: UserMin,
  ) {
    // Check access
    await this.checkHackathonAccess(hackathon, user, true);

    const thread = await this.prismaService.hackathonQuestionThread.findUnique({
      where: {
        id: threadId,
      },
      select: {
        id: true,
        hackathonId: true,
        userId: true,
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.hackathonId !== hackathon.id) {
      throw new BadRequestException(
        "Thread doesn't belong to this hackathon",
      );
    }

    // Check if user can edit (only creator can edit)
    if (!this.canEdit(thread.userId, user)) {
      throw new ForbiddenException(
        'You are not authorized to edit this thread. Only the creator can edit their own content.',
      );
    }

    // Build update data (only include fields that are provided)
    const updateData: any = {};
    if (updateThreadDto.title !== undefined) {
      updateData.title = updateThreadDto.title || null; // Allow setting to null
    }
    if (updateThreadDto.content !== undefined) {
      updateData.content = updateThreadDto.content;
    }
    if (updateThreadDto.attachments !== undefined) {
      updateData.attachments = updateThreadDto.attachments || [];
    }

    // Update thread (updatedAt will be automatically updated by Prisma)
    const updatedThread = await this.prismaService.hackathonQuestionThread.update({
      where: {
        id: threadId,
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return {
      message: 'Thread updated successfully',
      thread: {
        ...updatedThread,
        repliesCount: updatedThread._count.replies,
      },
    };
  }

  async updateReply(
    hackathon: HackathonMin,
    threadId: string,
    replyId: string,
    updateReplyDto: UpdateReplyDto,
    user: UserMin,
  ) {
    // Check access
    await this.checkHackathonAccess(hackathon, user, true);

    // Verify thread exists and belongs to hackathon
    const thread = await this.prismaService.hackathonQuestionThread.findUnique({
      where: {
        id: threadId,
      },
      select: {
        id: true,
        hackathonId: true,
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.hackathonId !== hackathon.id) {
      throw new BadRequestException(
        "Thread doesn't belong to this hackathon",
      );
    }

    // Get reply
    const reply = await this.prismaService.hackathonQuestionReply.findUnique({
      where: {
        id: replyId,
      },
      select: {
        id: true,
        threadId: true,
        userId: true,
      },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    if (reply.threadId !== threadId) {
      throw new BadRequestException("Reply doesn't belong to this thread");
    }

    // Check if user can edit (only creator can edit)
    if (!this.canEdit(reply.userId, user)) {
      throw new ForbiddenException(
        'You are not authorized to edit this reply. Only the creator can edit their own content.',
      );
    }

    // Build update data (only include fields that are provided)
    const updateData: any = {};
    if (updateReplyDto.content !== undefined) {
      updateData.content = updateReplyDto.content;
    }
    if (updateReplyDto.attachments !== undefined) {
      updateData.attachments = updateReplyDto.attachments || [];
    }

    // Update reply (updatedAt will be automatically updated by Prisma)
    const updatedReply = await this.prismaService.hackathonQuestionReply.update({
      where: {
        id: replyId,
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        parent: {
          select: {
            id: true,
            userId: true,
            content: true,
          },
        },
      },
    });

    return {
      message: 'Reply updated successfully',
      reply: updatedReply,
    };
  }

  async deleteThread(
    hackathon: HackathonMin,
    threadId: string,
    user: UserMin,
  ) {
    // Check access
    await this.checkHackathonAccess(hackathon, user, true);

    const thread = await this.prismaService.hackathonQuestionThread.findUnique({
      where: {
        id: threadId,
      },
      select: {
        id: true,
        hackathonId: true,
        userId: true,
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.hackathonId !== hackathon.id) {
      throw new BadRequestException(
        "Thread doesn't belong to this hackathon",
      );
    }

    // Check if user can delete
    if (!this.canDelete(thread.userId, hackathon, user)) {
      throw new ForbiddenException(
        'You are not authorized to delete this thread',
      );
    }

    // Delete thread (cascade will delete all replies)
    await this.prismaService.hackathonQuestionThread.delete({
      where: {
        id: threadId,
      },
    });

    return {
      message: 'Thread deleted successfully',
    };
  }

  async deleteReply(
    hackathon: HackathonMin,
    threadId: string,
    replyId: string,
    user: UserMin,
  ) {
    // Check access
    await this.checkHackathonAccess(hackathon, user, true);

    // Verify thread exists and belongs to hackathon
    const thread = await this.prismaService.hackathonQuestionThread.findUnique({
      where: {
        id: threadId,
      },
      select: {
        id: true,
        hackathonId: true,
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    if (thread.hackathonId !== hackathon.id) {
      throw new BadRequestException(
        "Thread doesn't belong to this hackathon",
      );
    }

    // Get reply
    const reply = await this.prismaService.hackathonQuestionReply.findUnique({
      where: {
        id: replyId,
      },
      select: {
        id: true,
        threadId: true,
        userId: true,
      },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    if (reply.threadId !== threadId) {
      throw new BadRequestException("Reply doesn't belong to this thread");
    }

    // Check if user can delete
    if (!this.canDelete(reply.userId, hackathon, user)) {
      throw new ForbiddenException(
        'You are not authorized to delete this reply',
      );
    }

    // Delete reply - cascade will automatically delete all nested replies (children)
    await this.prismaService.hackathonQuestionReply.delete({
      where: {
        id: replyId,
      },
    });

    return {
      message: 'Reply deleted successfully',
    };
  }
}
