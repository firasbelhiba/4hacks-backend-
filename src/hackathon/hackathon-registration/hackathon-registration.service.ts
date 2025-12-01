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
import { RegistrationQuestionDto } from '../dto/update.dto';
import {
  ActivityTargetType,
  HackathonRegistrationStatus,
  HackathonStatus,
  UserRole,
} from 'generated/prisma';

@Injectable()
export class HackathonRegistrationService {
  private readonly logger = new Logger(HackathonRegistrationService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async registerForHackathon(
    user: UserMin,
    RegisterForHackathonDto: RegisterForHackathonDto,
  ) {
    const { hackathonId, passCode } = RegisterForHackathonDto;

    // Check if hackathon exists
    const hackathon = await this.prismaService.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        organization: {
          select: { name: true, slug: true, ownerId: true },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if hackathon is cancelled or draft
    if (
      hackathon.status === HackathonStatus.CANCELLED ||
      hackathon.status === HackathonStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Cannot register for a hackathon that is cancelled or in draft status',
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

    //  Check if hackathon has questions to be answered before registration
    const hackathonQuestions =
      hackathon.registrationQuestions as unknown as RegistrationQuestionDto[];

    if (hackathonQuestions && hackathonQuestions.length > 0) {
      this.logger.log(
        `Hackathon ${hackathonId} has registration questions. User ${user.id} must answer them before completing registration.`,
      );
      const { registrationAnswers } = RegisterForHackathonDto;

      for (const question of hackathonQuestions) {
        const answer = registrationAnswers?.find(
          (ans) => ans.questionId === question.id,
        );

        if (question.required && (!answer || !answer.answer.trim())) {
          throw new BadRequestException(
            `Answer to question "${question.content}" is required for registration.`,
          );
        }
      }
    }

    // Create registration
    const registration = await this.prismaService.$transaction(async (tx) => {
      // Create the registration entry
      const newRegistration = await tx.hackathonRegistration.create({
        data: {
          hackathonId,
          userId: user.id,
          status: HackathonRegistrationStatus.APPROVED, // TODO: Change status flow if needed but for now auto approve
        },
      });

      // Store the answers to the registration questions
      await tx.hackathonRegistrationAnswer.create({
        data: {
          registrationId: newRegistration.id,
          answers: JSON.stringify(
            RegisterForHackathonDto.registrationAnswers ?? [],
          ),
        },
      });

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
    query: FindHackathonRegistrationsDto,
    user?: UserMin,
  ) {
    const { hackathonId, search } = query;

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

    if (existingHackathon.isPrivate && !isAdmin && !isOwner) {
      throw new BadRequestException(
        'You do not have permission to view registrations for this private hackathon',
      );
    }

    // TODO: check also if the user is registered to the hackathon to allow viewing registrations

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

    // Query paginated data
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
        user: r.user,
        registeredAt: r.registeredAt,
      })),
    };
  }
}
