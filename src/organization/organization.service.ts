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
   * Gets all organizations owned by a specific user.
   * - Public users see only public fields
   * - Owner sees all fields (their own organizations)
   * - Admins see all fields (for any user)
   * @param userId - The ID of the user whose organizations to retrieve
   * @param requester - Optional authenticated user (for owner/admin check)
   * @returns List of organizations with appropriate field visibility
   */
  async findByOwner(userId: string, requester?: UserMin) {
    // Resolve the target user
    const targetUser = await this.prismaService.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if requester is owner or admin
    const isOwner = requester?.id === targetUser.id;
    const isAdmin = requester?.role === UserRole.ADMIN;

    // Build select clause - different fields based on visibility
    const selectFields =
      isOwner || isAdmin
        ? {
            // Owner/Admin see all fields
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

    // Fetch organizations owned by the target user
    const organizations = await this.prismaService.organization.findMany({
      where: { ownerId: targetUser.id },
      select: selectFields,
      orderBy: { createdAt: 'desc' },
    });

    return organizations;
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
      const searchFields = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sector: { contains: search, mode: 'insensitive' } },
      ];

      // Admins can also search by email and phone
      if (isAdmin) {
        searchFields.push(
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
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
