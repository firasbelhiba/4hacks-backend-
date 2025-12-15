import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { UserMin } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterForHackathonDto } from './dto/register.dto';
import { FindHackathonRegistrationsDto } from './dto/find-registrations.dto';
import * as bcrypt from 'bcrypt';
import {
  ActivityTargetType,
  HackathonRegistrationStatus,
  HackathonStatus,
  RegistrationQuestionType,
  UserRole,
} from '@prisma/client';

@Injectable()
export class HackathonRegistrationService {
  private readonly logger = new Logger(HackathonRegistrationService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async registerForHackathon(
    hackathonId: string,
    user: UserMin,
    registerDto: RegisterForHackathonDto,
  ) {
    const { passCode, answers } = registerDto;

    // Check if hackathon exists with registration questions
    const hackathon = await this.prismaService.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        organization: {
          select: { name: true, slug: true, ownerId: true },
        },
        registrationQuestions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if hackathon is not active
    if (hackathon.status !== HackathonStatus.ACTIVE) {
      throw new BadRequestException(
        'Cannot register for a hackathon that is not active',
      );
    }

    // Check if the user is trying to register for their own hackathon
    if (hackathon.organization.ownerId === user.id) {
      throw new BadRequestException(
        'You cannot register for a hackathon you own',
      );
    }

    // Check if registration is open
    const now = new Date();

    if (now < hackathon.registrationStart || now > hackathon.registrationEnd) {
      throw new BadRequestException('Hackathon registration is not open');
    }

    // Check if user has already registered
    const existingRegistration =
      await this.prismaService.hackathonRegistration.findUnique({
        where: { hackathonId_userId: { hackathonId, userId: user.id } },
      });

    if (existingRegistration) {
      throw new BadRequestException(
        'You have already registered for this hackathon',
      );
    }

    // Check if hackathon is private
    if (hackathon.isPrivate) {
      if (!passCode) {
        throw new BadRequestException(
          'Passcode is required for private hackathons',
        );
      }

      if (!hackathon.invitePasscode) {
        throw new ConflictException(
          'This hackathon does not have a passcode set',
        );
      }

      const isValidPasscode = await bcrypt.compare(
        passCode,
        hackathon.invitePasscode,
      );

      if (!isValidPasscode) {
        throw new BadRequestException('Invalid passcode for private hackathon');
      }
    }

    // Validate answers against registration questions
    const questions = hackathon.registrationQuestions;

    if (questions && questions.length > 0) {
      this.logger.log(
        `Hackathon ${hackathonId} has ${questions.length} registration questions. User ${user.id} must answer required ones.`,
      );

      // Create a map of answers for easy lookup
      const answersMap = new Map(
        (answers || []).map((a) => [a.questionId, a.value]),
      );

      for (const question of questions) {
        const answerValue = answersMap.get(question.id);
        const hasAnswer =
          answerValue && answerValue.length > 0 && answerValue[0].trim() !== '';

        // Check required questions
        if (question.required && !hasAnswer) {
          throw new BadRequestException(
            `Answer to question "${question.label}" is required for registration.`,
          );
        }

        // Validate SELECT/MULTISELECT answers against options
        if (
          hasAnswer &&
          (question.type === RegistrationQuestionType.SELECT ||
            question.type === RegistrationQuestionType.MULTISELECT)
        ) {
          const invalidOptions = answerValue.filter(
            (v) => !question.options.includes(v),
          );
          if (invalidOptions.length > 0) {
            throw new BadRequestException(
              `Invalid option(s) "${invalidOptions.join(', ')}" for question "${question.label}". Valid options are: ${question.options.join(', ')}`,
            );
          }

          // SELECT should have only one answer
          if (
            question.type === RegistrationQuestionType.SELECT &&
            answerValue.length > 1
          ) {
            throw new BadRequestException(
              `Question "${question.label}" only allows one answer.`,
            );
          }
        }
      }
    }

    // Create registration with answers
    const registration = await this.prismaService.$transaction(async (tx) => {
      // Create the registration entry
      const newRegistration = await tx.hackathonRegistration.create({
        data: {
          hackathonId,
          userId: user.id,
          status: HackathonRegistrationStatus.APPROVED, // TODO: Change status flow if needed but for now auto approve
        },
      });

      // Store individual answers for each question
      if (answers && answers.length > 0) {
        await tx.hackathonRegistrationAnswer.createMany({
          data: answers.map((a) => ({
            registrationId: newRegistration.id,
            questionId: a.questionId,
            value: a.value,
          })),
        });
      }

      // Store the registration activity in user activity log
      await tx.userActivityLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER_TO_HACKATHON',
          targetType: ActivityTargetType.HACKATHON,
          targetId: hackathonId,
          description: `registered for hackathon ${hackathon.slug}`,
        },
      });

      return newRegistration;
    });

    this.logger.log(
      `User ${user.id} successfully registered for hackathon ${hackathonId}`,
    );

    return {
      message: 'Successfully registered for the hackathon',
      data: registration,
    };
  }

  async getHackathonRegisteredUsers(
    hackathonId: string,
    query: FindHackathonRegistrationsDto,
    user?: UserMin,
  ) {
    const { search } = query;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const existingHackathon = await this.prismaService.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        isPrivate: true,
        organization: { select: { ownerId: true } },
      },
    });

    if (!existingHackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    const isAdmin = user && user.role === UserRole.ADMIN;
    const isOwner = user && user.id === existingHackathon.organization.ownerId;
    const hasSpecialAccess = isAdmin || isOwner;

    // Check if user is registered for the hackathon (for private hackathons)
    // Only APPROVED registrations grant access to view registrations
    let isRegistered = false;
    if (existingHackathon.isPrivate && user && !hasSpecialAccess) {
      const userRegistration =
        await this.prismaService.hackathonRegistration.findUnique({
          where: {
            hackathonId_userId: {
              hackathonId,
              userId: user.id,
            },
          },
        });
      // Only approved registrations allow viewing registrations
      isRegistered =
        !!userRegistration &&
        userRegistration.status === HackathonRegistrationStatus.APPROVED;
    }

    // Access control for private hackathons:
    // - Admins can always access
    // - Organizers can always access
    // - Registered users can access (but without answers)
    // - Others cannot access
    if (existingHackathon.isPrivate && !hasSpecialAccess && !isRegistered) {
      throw new BadRequestException(
        'You do not have permission to view registrations for this private hackathon. You must be registered and approved to view registrations.',
      );
    }

    // Build where clause for search
    const where: any = {
      hackathonId,
      user: {},
    };
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Query paginated data with conditional include based on user role
    const registrations =
      await this.prismaService.hackathonRegistration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { registeredAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              image: true,
            },
          },
          // Include answers only for admins and organizers
          ...(hasSpecialAccess
            ? {
                answers: {
                  include: {
                    question: {
                      select: {
                        id: true,
                        label: true,
                        type: true,
                      },
                    },
                  },
                },
              }
            : {}),
        },
      });

    // Query total count
    const total = await this.prismaService.hackathonRegistration.count({
      where,
    });

    return {
      total,
      page,
      limit,
      data: registrations.map((r) => ({
        id: r.id,
        status: r.status,
        user: r.user,
        registeredAt: r.registeredAt,
        // Include answers and review info only for admins and organizers
        ...(hasSpecialAccess
          ? {
              answers: r.answers,
              reviewedAt: r.reviewedAt,
              reviewedById: r.reviewedById,
            }
          : {}),
      })),
    };
  }
}
