import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { UserMin } from 'src/common/types';
import {
  CreateRegistrationQuestionDto,
  UpdateRegistrationQuestionDto,
  ReorderQuestionsDto,
  BulkCreateQuestionsDto,
  RegistrationQuestionType,
} from './dto/registration-question.dto';
import { HackathonStatus, UserRole } from '@prisma/client';

@Injectable()
export class HackathonRegistrationQuestionService {
  private readonly logger = new Logger(
    HackathonRegistrationQuestionService.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if user has permission to manage hackathon questions
   * Only organization owner or admin can manage questions
   */
  private async checkManagePermission(
    hackathonId: string,
    user: UserMin,
  ): Promise<{
    hackathon: { id: string; status: HackathonStatus };
    hasRegistrations: boolean;
  }> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        status: true,
        organization: { select: { ownerId: true } },
        _count: { select: { hackathonRegistrations: true } },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isOwner = hackathon.organization.ownerId === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You are not authorized to manage questions for this hackathon',
      );
    }

    return {
      hackathon: { id: hackathon.id, status: hackathon.status },
      hasRegistrations: hackathon._count.hackathonRegistrations > 0,
    };
  }

  /**
   * Validate question data based on type
   */
  private validateQuestionData(
    type: RegistrationQuestionType,
    options?: string[],
  ): void {
    // SELECT and MULTISELECT require at least 2 options
    if (
      (type === RegistrationQuestionType.SELECT ||
        type === RegistrationQuestionType.MULTISELECT) &&
      (!options || options.length < 2)
    ) {
      throw new BadRequestException(
        `${type} questions require at least 2 options`,
      );
    }
  }

  /**
   * Get all registration questions for a hackathon
   */
  async getQuestions(hackathonId: string, user?: UserMin) {
    // Check if hackathon exists and user has access
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        id: true,
        status: true,
        isPrivate: true,
        organization: { select: { ownerId: true } },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // For public active hackathons, anyone can view questions
    // For private or non-active hackathons, only owner/admin can view
    const isAdmin = user?.role === UserRole.ADMIN;
    const isOwner = user && hackathon.organization.ownerId === user.id;
    const isActive = hackathon.status === HackathonStatus.ACTIVE;

    if (!isActive && !isAdmin && !isOwner) {
      throw new NotFoundException('Hackathon not found');
    }

    const questions = await this.prisma.hackathonRegistrationQuestion.findMany({
      where: { hackathonId },
      orderBy: { order: 'asc' },
    });

    return { data: questions };
  }

  /**
   * Get a single registration question
   */
  async getQuestion(hackathonId: string, questionId: string) {
    const question = await this.prisma.hackathonRegistrationQuestion.findFirst({
      where: { id: questionId, hackathonId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return { data: question };
  }

  /**
   * Create a new registration question
   */
  async createQuestion(
    hackathonId: string,
    user: UserMin,
    dto: CreateRegistrationQuestionDto,
  ) {
    const { hasRegistrations } = await this.checkManagePermission(
      hackathonId,
      user,
    );

    // Lock questions if registrations exist
    if (hasRegistrations) {
      throw new BadRequestException(
        'Cannot add questions after users have registered. Questions are locked once the first registration is submitted.',
      );
    }

    // Validate question type and options
    const type = dto.type || RegistrationQuestionType.TEXT;
    this.validateQuestionData(type, dto.options);

    // Get max order for new question
    const maxOrderResult =
      await this.prisma.hackathonRegistrationQuestion.aggregate({
        where: { hackathonId },
        _max: { order: true },
      });

    const newOrder = dto.order ?? (maxOrderResult._max.order ?? -1) + 1;

    const question = await this.prisma.hackathonRegistrationQuestion.create({
      data: {
        hackathonId,
        label: dto.label,
        description: dto.description,
        type,
        required: dto.required ?? false,
        placeholder: dto.placeholder,
        options: dto.options ?? [],
        order: newOrder,
      },
    });

    this.logger.log(
      `Created registration question ${question.id} for hackathon ${hackathonId}`,
    );

    return {
      message: 'Question created successfully',
      data: question,
    };
  }

  /**
   * Create multiple registration questions at once
   */
  async bulkCreateQuestions(
    hackathonId: string,
    user: UserMin,
    dto: BulkCreateQuestionsDto,
  ) {
    const { hasRegistrations } = await this.checkManagePermission(
      hackathonId,
      user,
    );

    if (hasRegistrations) {
      throw new BadRequestException(
        'Cannot add questions after users have registered. Questions are locked once the first registration is submitted.',
      );
    }

    // Validate all questions
    for (const q of dto.questions) {
      const type = q.type || RegistrationQuestionType.TEXT;
      this.validateQuestionData(type, q.options);
    }

    // Get max order
    const maxOrderResult =
      await this.prisma.hackathonRegistrationQuestion.aggregate({
        where: { hackathonId },
        _max: { order: true },
      });

    let currentOrder = (maxOrderResult._max.order ?? -1) + 1;

    const questions = await this.prisma.$transaction(
      dto.questions.map((q, index) =>
        this.prisma.hackathonRegistrationQuestion.create({
          data: {
            hackathonId,
            label: q.label,
            description: q.description,
            type: q.type || RegistrationQuestionType.TEXT,
            required: q.required ?? false,
            placeholder: q.placeholder,
            options: q.options ?? [],
            order: q.order ?? currentOrder + index,
          },
        }),
      ),
    );

    this.logger.log(
      `Created ${questions.length} registration questions for hackathon ${hackathonId}`,
    );

    return {
      message: `${questions.length} questions created successfully`,
      data: questions,
    };
  }

  /**
   * Update a registration question
   */
  async updateQuestion(
    hackathonId: string,
    questionId: string,
    user: UserMin,
    dto: UpdateRegistrationQuestionDto,
  ) {
    const { hasRegistrations } = await this.checkManagePermission(
      hackathonId,
      user,
    );

    // Check if question exists
    const existingQuestion =
      await this.prisma.hackathonRegistrationQuestion.findFirst({
        where: { id: questionId, hackathonId },
      });

    if (!existingQuestion) {
      throw new NotFoundException('Question not found');
    }

    // If registrations exist, only allow updating non-structural fields
    if (hasRegistrations) {
      // Only allow updating label, description, placeholder, and order
      const allowedFields = ['label', 'description', 'placeholder', 'order'];
      const attemptedFields = Object.keys(dto);
      const disallowedFields = attemptedFields.filter(
        (f) => !allowedFields.includes(f) && dto[f] !== undefined,
      );

      if (disallowedFields.length > 0) {
        throw new BadRequestException(
          `Cannot modify ${disallowedFields.join(', ')} after users have registered. Only label, description, placeholder, and order can be updated.`,
        );
      }
    }

    // Validate if changing type or options
    const newType = dto.type || existingQuestion.type;
    const newOptions = dto.options ?? existingQuestion.options;
    this.validateQuestionData(
      newType as RegistrationQuestionType,
      newOptions as string[],
    );

    const updatedQuestion =
      await this.prisma.hackathonRegistrationQuestion.update({
        where: { id: questionId },
        data: {
          label: dto.label,
          description: dto.description,
          type: dto.type,
          required: dto.required,
          placeholder: dto.placeholder,
          options: dto.options,
          order: dto.order,
        },
      });

    this.logger.log(
      `Updated registration question ${questionId} for hackathon ${hackathonId}`,
    );

    return {
      message: 'Question updated successfully',
      data: updatedQuestion,
    };
  }

  /**
   * Delete a registration question
   */
  async deleteQuestion(
    hackathonId: string,
    questionId: string,
    user: UserMin,
  ) {
    const { hasRegistrations } = await this.checkManagePermission(
      hackathonId,
      user,
    );

    if (hasRegistrations) {
      throw new BadRequestException(
        'Cannot delete questions after users have registered. Questions are locked once the first registration is submitted.',
      );
    }

    // Check if question exists
    const existingQuestion =
      await this.prisma.hackathonRegistrationQuestion.findFirst({
        where: { id: questionId, hackathonId },
      });

    if (!existingQuestion) {
      throw new NotFoundException('Question not found');
    }

    await this.prisma.hackathonRegistrationQuestion.delete({
      where: { id: questionId },
    });

    this.logger.log(
      `Deleted registration question ${questionId} from hackathon ${hackathonId}`,
    );

    return {
      message: 'Question deleted successfully',
    };
  }

  /**
   * Reorder questions
   */
  async reorderQuestions(
    hackathonId: string,
    user: UserMin,
    dto: ReorderQuestionsDto,
  ) {
    await this.checkManagePermission(hackathonId, user);

    // Verify all question IDs belong to this hackathon
    const existingQuestions =
      await this.prisma.hackathonRegistrationQuestion.findMany({
        where: { hackathonId },
        select: { id: true },
      });

    const existingIds = new Set(existingQuestions.map((q) => q.id));
    const invalidIds = dto.questionIds.filter((id) => !existingIds.has(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Questions not found: ${invalidIds.join(', ')}`,
      );
    }

    // Update order for each question
    await this.prisma.$transaction(
      dto.questionIds.map((id, index) =>
        this.prisma.hackathonRegistrationQuestion.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    // Return updated questions
    const questions = await this.prisma.hackathonRegistrationQuestion.findMany({
      where: { hackathonId },
      orderBy: { order: 'asc' },
    });

    this.logger.log(
      `Reordered ${dto.questionIds.length} questions for hackathon ${hackathonId}`,
    );

    return {
      message: 'Questions reordered successfully',
      data: questions,
    };
  }
}
