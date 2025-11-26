import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HackathonStatus } from 'generated/prisma';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(
    userId: string,
    createOrganizationDto: CreateOrganizationDto,
    logo?: Express.Multer.File,
  ) {
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

    // Upload logo if provided
    let logoUrl: string | undefined;
    if (logo) {
      this.logger.log('Uploading organization logo');
      try {
        logoUrl = await this.fileUploadService.uploadOrganizationLogo(
          logo,
          slug,
        );
        this.logger.log(`Logo uploaded successfully: ${logoUrl}`);
      } catch (error) {
        this.logger.error('Failed to upload logo', error);
        throw new BadRequestException('Failed to upload logo image');
      }
    }

    // Create the organization
    const organization = await this.prismaService.organization.create({
      data: {
        ...createOrganizationDto,
        logo: logoUrl,
        ownerId: userId,
      },
    });

    return {
      message: 'Organization created successfully',
      data: organization,
    };
  }

  async findOne(identifier: string, userId?: string) {
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
          where: {
            OR: [
              { status: { not: HackathonStatus.DRAFT } }, // always show non draft ones
              ...(userId
                ? [
                    {
                      status: HackathonStatus.DRAFT,
                      organization: { ownerId: userId },
                    },
                  ]
                : []), // if logged in, show drafts only if user is owner
            ],
          },
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
