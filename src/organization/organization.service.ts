import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, createOrganizationDto: CreateOrganizationDto) {
    this.logger.log('Creating organization');

    const { name, slug } = createOrganizationDto;

    // Check if the organization already exists by name or slug
    const existingOrg = await this.prismaService.organization.findFirst({
      where: {
        OR: [{ name: name }, { slug: slug }],
      },
      select: {
        name: true,
        slug: true,
      },
    });

    if (existingOrg) {
      if (existingOrg.name === name) {
        throw new ConflictException(
          'Organization with this name already exists.',
        );
      }
      if (existingOrg.slug === slug) {
        throw new ConflictException(
          'Organization with this slug already exists.',
        );
      }
    }

    // Create the organization
    const organization = await this.prismaService.organization.create({
      data: {
        ...createOrganizationDto,
        ownerId: userId,
      },
    });

    return {
      message: 'Organization created successfully',
      data: organization,
    };
  }

  async findOne(identifier: string) {
    const organization = await this.prismaService.organization.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }, { name: identifier }],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        hackathons: {
          select: {
            id: true,
            slug: true,
            title: true,
            organizationId: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return {
      message: 'Organization fetched successfully',
      data: organization,
    };
  }
}
