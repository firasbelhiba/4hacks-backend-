import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create.dto';
import { UpdateOrganizationDto } from './dto/update.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ActivityTargetType,
  HackathonStatus,
  Prisma,
  UserRole,
} from 'generated/prisma';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import {
  QueryOrganizationsDto,
  PaginatedOrganizationsDto,
} from './dto/query-organizations.dto';
import type { UserMin } from 'src/common/types';

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

    // Create the organization And store that activity in user activity log
    const organization = await this.prismaService.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          ...createOrganizationDto,
          logo: logoUrl,
          ownerId: userId,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo: true,
          owner: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      // Store the organization creation activity in user activity log
      await tx.userActivityLog.create({
        data: {
          userId: userId,
          action: 'CREATE_ORGANIZATION',
          // targetType: ActivityTargetType.ORGANIZATION,
          targetId: organization.id,
          description: `${organization.owner.name} Created organization ${organization.name}`,
        },
      });

      return organization;
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
              { status: HackathonStatus.ACTIVE }, // always show active ones
              ...(userId
                ? [
                    {
                      status: HackathonStatus.DRAFT,
                      organization: { ownerId: userId },
                    },
                    {
                      status: HackathonStatus.CANCELLED,
                      organization: { ownerId: userId },
                    },
                    {
                      status: HackathonStatus.ARCHIVED,
                      organization: { ownerId: userId },
                    },
                  ]
                : []), // if logged in, show any other staus than active
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

    return organization;
  }

  async update(
    userId: string,
    identifier: string,
    updateOrganizationDto: UpdateOrganizationDto,
    logo?: Express.Multer.File,
  ) {
    this.logger.log(`Updating organization: ${identifier}`);

    // Find the organization
    const organization = await this.prismaService.organization.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }, { name: identifier }],
      },
      select: {
        id: true,
        ownerId: true,
        slug: true,
        name: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if the user is the owner
    if (organization.ownerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this organization',
      );
    }

    // Check for duplicate name or slug if they are being updated
    if (updateOrganizationDto.name || updateOrganizationDto.slug) {
      const duplicateOrg = await this.prismaService.organization.findFirst({
        where: {
          AND: [
            { id: { not: organization.id } }, // Exclude current organization
            {
              OR: [
                ...(updateOrganizationDto.name
                  ? [{ name: updateOrganizationDto.name }]
                  : []),
                ...(updateOrganizationDto.slug
                  ? [{ slug: updateOrganizationDto.slug }]
                  : []),
              ],
            },
          ],
        },
        select: {
          name: true,
          slug: true,
        },
      });

      if (duplicateOrg) {
        if (
          updateOrganizationDto.name &&
          duplicateOrg.name === updateOrganizationDto.name
        ) {
          throw new ConflictException(
            'Organization with this name already exists.',
          );
        }
        if (
          updateOrganizationDto.slug &&
          duplicateOrg.slug === updateOrganizationDto.slug
        ) {
          throw new ConflictException(
            'Organization with this slug already exists.',
          );
        }
      }
    }

    // Upload new logo if provided
    let logoUrl: string | undefined;
    if (logo) {
      this.logger.log('Uploading new organization logo');
      try {
        // Use the new slug if provided, otherwise use the existing one
        const slugForUpload = updateOrganizationDto.slug || organization.slug;
        logoUrl = await this.fileUploadService.uploadOrganizationLogo(
          logo,
          slugForUpload,
        );
        this.logger.log(`Logo uploaded successfully: ${logoUrl}`);
      } catch (error) {
        this.logger.error('Failed to upload logo', error);
        throw new BadRequestException('Failed to upload logo image');
      }
    }

    // Update the organization
    const updatedOrganization = await this.prismaService.organization.update({
      where: { id: organization.id },
      data: {
        ...updateOrganizationDto,
        ...(logoUrl && { logo: logoUrl }),
      },
    });

    return {
      message: 'Organization updated successfully',
      data: updatedOrganization,
    };
  }

  /**
   * Gets all organizations with pagination, filtering, search, and sorting.
   * - Admins see all fields including sensitive data (email, phone, ownerId, etc.)
   * - Non-admins see only public fields
   * @param query - Query parameters for pagination, filtering, search, and sorting.
   * @param user - Optional authenticated user (for admin check).
   * @returns Paginated list of organizations with appropriate field visibility.
   */
  async findAll(
    query: QueryOrganizationsDto,
    user?: UserMin,
  ): Promise<PaginatedOrganizationsDto> {
    const isAdmin = user?.role === UserRole.ADMIN;
    const {
      page = 1,
      limit = 10,
      type,
      size,
      country,
      city,
      operatingRegion,
      sector,
      establishedYearFrom,
      establishedYearTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build where clause for filtering
    const where: Prisma.OrganizationWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (size) {
      where.size = size;
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (operatingRegion) {
      where.operatingRegions = { has: operatingRegion };
    }

    if (sector) {
      where.sector = { contains: sector, mode: 'insensitive' };
    }

    if (establishedYearFrom || establishedYearTo) {
      where.establishedYear = {};
      if (establishedYearFrom) {
        where.establishedYear.gte = establishedYearFrom;
      }
      if (establishedYearTo) {
        where.establishedYear.lte = establishedYearTo;
      }
    }

    // Search across multiple fields
    if (search) {
      const searchFields: Prisma.OrganizationWhereInput[] = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { displayName: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
        { tagline: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { sector: { contains: search, mode: 'insensitive' as const } },
      ];

      // Admins can also search by email and phone
      if (isAdmin) {
        searchFields.push(
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
        );
      }

      where.OR = searchFields;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy clause for sorting
    const orderBy: Prisma.OrganizationOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Build select clause - different fields for admins vs public
    const selectFields = isAdmin
      ? {
          // Admins see all fields
          id: true,
          name: true,
          slug: true,
          displayName: true,
          logo: true,
          tagline: true,
          description: true,
          type: true,
          establishedYear: true,
          size: true,
          operatingRegions: true,
          email: true, // Private field
          phone: true, // Private field
          country: true,
          city: true,
          state: true, // Private field
          zipCode: true, // Private field
          loc_address: true, // Private field
          website: true,
          linkedin: true,
          github: true,
          twitter: true,
          discord: true,
          telegram: true,
          medium: true,
          youtube: true,
          facebook: true,
          instagram: true,
          reddit: true,
          warpcast: true,
          otherSocials: true, // Private field
          sector: true,
          ownerId: true, // Private field
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true, // Private field
              image: true,
            },
          },
        }
      : {
          // Public fields only
          id: true,
          name: true,
          slug: true,
          displayName: true,
          logo: true,
          tagline: true,
          description: true,
          type: true,
          establishedYear: true,
          size: true,
          operatingRegions: true,
          country: true,
          city: true,
          website: true,
          linkedin: true,
          github: true,
          twitter: true,
          discord: true,
          telegram: true,
          medium: true,
          youtube: true,
          facebook: true,
          instagram: true,
          reddit: true,
          warpcast: true,
          sector: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prismaService.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: selectFields,
      }),
      this.prismaService.organization.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
}
