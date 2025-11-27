import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHackathonRequestDto } from './dto/create-request.dto';
import { UserMin } from 'src/common/types';
import { UserRole } from 'generated/prisma';

@Injectable()
export class RequestService {
  private readonly logger = new Logger(RequestService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, createRequestDto: CreateHackathonRequestDto) {
    const { organizationId } = createRequestDto;

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
            owner: true,
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
}
