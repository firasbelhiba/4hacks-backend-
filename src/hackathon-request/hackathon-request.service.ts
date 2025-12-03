import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHackathonRequestDto } from './dto/create-request.dto';
import { UserMin } from 'src/common/types';
import { UserRole } from 'generated/prisma';

@Injectable()
export class HackathonRequestService {
  private readonly logger = new Logger(HackathonRequestService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, createRequestDto: CreateHackathonRequestDto) {
    const {
      organizationId,
      registrationStart,
      registrationEnd,
      startDate,
      endDate,
      judgingStart,
      judgingEnd,
    } = createRequestDto;

    // Check if organization exists and user is owner
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.ownerId !== userId) {
      throw new ForbiddenException(
        'You are not the owner of this organization',
      );
    }

    // Find if a hackathon with that slug already exists
    const existingHackathon = await this.prisma.hackathon.findUnique({
      where: { slug: createRequestDto.hackSlug },
    });

    if (existingHackathon) {
      throw new ConflictException('Hackathon with this slug already exists');
    }

    // Validate date logic
    if (registrationStart >= registrationEnd) {
      throw new BadRequestException(
        'Registration start date must be before registration end date',
      );
    }

    if (startDate >= endDate) {
      throw new BadRequestException(
        'Hackathon start date must be before end date',
      );
    }

    if (registrationEnd > startDate) {
      throw new BadRequestException(
        'Registration must end before or when the hackathon starts',
      );
    }

    // Validate judging dates if provided
    if (!judgingStart && judgingEnd) {
      throw new BadRequestException(
        'Judging end date cannot exist without a judging start date',
      );
    }

    if (!judgingEnd && judgingStart) {
      throw new BadRequestException(
        'Judging start date cannot exist without a judging end date',
      );
    }

    // Validate judging dates if provided
    if (judgingStart) {
      if (judgingStart < endDate) {
        throw new BadRequestException(
          'Judging start date must be after or equal to hackathon end date',
        );
      }

      if (judgingEnd) {
        if (judgingStart >= judgingEnd) {
          throw new BadRequestException(
            'Judging start date must be before judging end date',
          );
        }
      }
    }

    this.logger.log('Creating hackathon request');

    try {
      // Create the request
      const request = await this.prisma.hackathonCreationRequest.create({
        data: {
          ...createRequestDto,
        },
      });

      return {
        message: 'Hackathon request created successfully',
        data: request,
      };
    } catch (error) {
      if (
        error.code === 'P2002' &&
        error.meta?.driverAdapterError?.cause?.constraint?.fields?.includes(
          '"hackSlug"',
        )
      ) {
        throw new ConflictException(
          'Hackathon Request with this slug already exists',
        );
      }
      throw error;
    }
  }

  async findOne(identifier: string, user: UserMin) {
    // Check if user is an ADMIN
    const isAdmin = user.role === UserRole.ADMIN;

    const request = await this.prisma.hackathonCreationRequest.findFirst({
      where: {
        // OR condition checks if the identifier matches EITHER ID or hackSlug
        OR: [{ id: identifier }, { hackSlug: identifier }],
        // If user is admin, they can see any request
        // If user is not admin, they can only see their own organization requests
        ...(isAdmin ? {} : { organization: { ownerId: user.id } }),
      },
      include: {
        organization: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(
        'Hackathon request not found or you are not authorized to view it',
      );
    }

    return request;
  }

  async findByOrganization(identifier: string, user: UserMin) {
    // Check if user is an ADMIN
    const isAdmin = user.role === UserRole.ADMIN;

    // First, find the organization by id, slug, or name
    const organization = await this.prisma.organization.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }, { name: identifier }],
        // If user is not admin, they can only see their own organization
        ...(isAdmin ? {} : { ownerId: user.id }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(
        'Organization not found or you are not authorized to view it',
      );
    }

    // Get all hackathon requests for this organization
    const requests = await this.prisma.hackathonCreationRequest.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      organization,
      requests,
      total: requests.length,
    };
  }
}
