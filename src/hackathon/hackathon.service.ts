import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateHackathonDto } from './dto/update.dto';
import { ManageTracksDto } from './dto/track.dto';
import { ManageSponsorsDto } from './dto/sponsor.dto';
import {
  QueryHackathonsDto,
  PaginatedHackathonsDto,
} from './dto/query-hackathons.dto';
import { HackathonStatus, UserRole, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserMin } from 'src/common/types';

@Injectable()
export class HackathonService {
  private readonly logger = new Logger(HackathonService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets all hackathons with pagination, filtering, search, and sorting.
   * Access control:
   * - Admins see all hackathons
   * - Authenticated users see all ACTIVE hackathons + their own non-public hackathons
   * - Unauthenticated users see only ACTIVE hackathons
   * @param query - Query parameters for pagination, filtering, search, and sorting.
   * @param user - Optional authenticated user.
   * @returns Paginated list of hackathons.
   */
  async findAll(
    query: QueryHackathonsDto,
    user?: UserMin,
  ): Promise<PaginatedHackathonsDto> {
    const isAdmin = user?.role === UserRole.ADMIN;
    const userId = user?.id;

    const {
      page = 1,
      limit = 10,
      status,
      type,
      category,
      isPrivate,
      prizePoolFrom,
      prizePoolTo,
      startDateFrom,
      startDateTo,
      organizationId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build visibility where clause based on user role
    let visibilityWhere: Prisma.HackathonWhereInput;

    if (isAdmin) {
      // Admin sees everything
      visibilityWhere = {};
    } else if (userId) {
      // Authenticated user: ACTIVE + own non-public hackathons
      visibilityWhere = {
        OR: [
          { status: HackathonStatus.ACTIVE },
          {
            status: {
              in: [
                HackathonStatus.DRAFT,
                HackathonStatus.ARCHIVED,
                HackathonStatus.CANCELLED,
              ],
            },
            organization: { ownerId: userId },
          },
        ],
      };
    } else {
      // Unauthenticated: only ACTIVE
      visibilityWhere = { status: HackathonStatus.ACTIVE };
    }

    // Build additional filters
    const filterWhere: Prisma.HackathonWhereInput = {};

    if (status) {
      filterWhere.status = status;
    }

    if (type) {
      filterWhere.type = type;
    }

    if (category) {
      filterWhere.category = {
        name: category,
      };
    }

    if (isPrivate !== undefined) {
      filterWhere.isPrivate = isPrivate;
    }

    if (prizePoolFrom !== undefined || prizePoolTo !== undefined) {
      filterWhere.prizePool = {};
      if (prizePoolFrom !== undefined) {
        filterWhere.prizePool.gte = prizePoolFrom;
      }
      if (prizePoolTo !== undefined) {
        filterWhere.prizePool.lte = prizePoolTo;
      }
    }

    if (startDateFrom || startDateTo) {
      filterWhere.startDate = {};
      if (startDateFrom) {
        filterWhere.startDate.gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        filterWhere.startDate.lte = new Date(startDateTo);
      }
    }

    if (organizationId) {
      filterWhere.organizationId = organizationId;
    }

    // Search across multiple fields
    if (search) {
      filterWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Combine visibility and filter conditions
    const where: Prisma.HackathonWhereInput = {
      AND: [visibilityWhere, filterWhere],
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy clause for sorting
    const orderBy: Prisma.HackathonOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Select fields for the list view
    const selectFields = {
      id: true,
      title: true,
      slug: true,
      status: true,
      type: true,
      category: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      banner: true,
      tagline: true,
      prizePool: true,
      prizeToken: true,
      isPrivate: true,
      registrationStart: true,
      registrationEnd: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.hackathon.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: selectFields,
      }),
      this.prisma.hackathon.count({ where }),
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

  async update(
    hackathonIdentifier: string,
    userId: string,
    updateHackathonDto: UpdateHackathonDto,
  ) {
    // Check if hackathon exists
    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: hackathonIdentifier }, { slug: hackathonIdentifier }],
      },
      include: {
        organization: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if user is owner of hackathon
    if (hackathon.organization.ownerId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this hackathon',
      );
    }

    // Validate team size logic
    if (
      updateHackathonDto.minTeamSize !== undefined &&
      updateHackathonDto.maxTeamSize !== undefined
    ) {
      if (updateHackathonDto.minTeamSize > updateHackathonDto.maxTeamSize) {
        throw new BadRequestException(
          'Minimum team size cannot be greater than maximum team size',
        );
      }
    } else if (updateHackathonDto.minTeamSize !== undefined) {
      if (updateHackathonDto.minTeamSize > hackathon.maxTeamSize) {
        throw new BadRequestException(
          'Minimum team size cannot be greater than current maximum team size',
        );
      }
    } else if (updateHackathonDto.maxTeamSize !== undefined) {
      if (updateHackathonDto.maxTeamSize < hackathon.minTeamSize) {
        throw new BadRequestException(
          'Maximum team size cannot be less than current minimum team size',
        );
      }
    }

    // Validate private hackathon requirements
    if (
      updateHackathonDto.isPrivate &&
      !updateHackathonDto.invitePasscode &&
      !hackathon.invitePasscode
    ) {
      throw new BadRequestException(
        'Invite passcode is required for private hackathons',
      );
    }

    // Prepare update data (exclude registrationQuestions as it's handled separately)
    const { registrationQuestions, ...restDto } = updateHackathonDto;
    const updateData: any = {
      ...restDto,
      categoryId: undefined,
      category: undefined,
    };

    // Validate the category
    if (updateHackathonDto.category) {
      console.log(updateHackathonDto.category);
      const category = await this.prisma.hackathonCategory.findUnique({
        where: { name: updateHackathonDto.category.toUpperCase() },
        select: { id: true },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      updateData.categoryId = category.id;
    }

    // Hash invite passcode if provided
    if (updateHackathonDto.invitePasscode) {
      updateData.invitePasscode = await bcrypt.hash(
        updateHackathonDto.invitePasscode,
        10,
      );
    }

    // If setting hackathon to public, clear the passcode
    if (updateHackathonDto.isPrivate === false) {
      updateData.invitePasscode = null;
    }

    // TODO: Validate dates logic(same can be taken from hackathon-request create and publish hackathon)

    // Handle registration questions if provided
    if (registrationQuestions && registrationQuestions.length > 0) {
      // Check if there are any registrations - if so, questions are locked
      const registrationCount = await this.prisma.hackathonRegistration.count({
        where: { hackathonId: hackathon.id },
      });

      if (registrationCount > 0) {
        throw new BadRequestException(
          'Cannot modify registration questions after users have registered. Use the dedicated question endpoints for limited updates.',
        );
      }

      // Validate question types and options
      for (const q of registrationQuestions) {
        const type = q.type || 'TEXT';
        if (
          (type === 'SELECT' || type === 'MULTISELECT') &&
          (!q.options || q.options.length < 2)
        ) {
          throw new BadRequestException(
            `${type} questions require at least 2 options`,
          );
        }
      }
    }

    // Update hackathon and questions in a transaction
    const updatedHackathon = await this.prisma.$transaction(async (tx) => {
      // Update hackathon basic fields
      const updated = await tx.hackathon.update({
        where: { id: hackathon.id },
        data: updateData,
        include: {
          category: true,
          registrationQuestions: { orderBy: { order: 'asc' } },
        },
      });

      // Handle registration questions if provided
      if (registrationQuestions && registrationQuestions.length > 0) {
        // Get existing question IDs
        const existingQuestions =
          await tx.hackathonRegistrationQuestion.findMany({
            where: { hackathonId: hackathon.id },
            select: { id: true },
          });
        const existingIds = existingQuestions.map((q) => q.id);

        // Identify questions to update, create, or delete
        const incomingIds = registrationQuestions
          .filter((q) => q.id)
          .map((q) => q.id as string);
        const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
        const toUpdate = registrationQuestions.filter(
          (q) => q.id && existingIds.includes(q.id),
        );
        const toCreate = registrationQuestions.filter((q) => !q.id);

        // Delete removed questions
        if (toDelete.length > 0) {
          await tx.hackathonRegistrationQuestion.deleteMany({
            where: { id: { in: toDelete }, hackathonId: hackathon.id },
          });
        }

        // Update existing questions
        for (const q of toUpdate) {
          await tx.hackathonRegistrationQuestion.update({
            where: { id: q.id },
            data: {
              label: q.label,
              description: q.description,
              type: q.type as any,
              required: q.required,
              placeholder: q.placeholder,
              options: q.options,
              order: q.order,
            },
          });
        }

        // Create new questions
        if (toCreate.length > 0) {
          const maxOrder =
            Math.max(
              ...registrationQuestions.map((q) => q.order ?? 0),
              ...existingQuestions.map(() => -1),
            ) + 1;

          await tx.hackathonRegistrationQuestion.createMany({
            data: toCreate.map((q, index) => ({
              hackathonId: hackathon.id,
              label: q.label,
              description: q.description,
              type: (q.type as any) || 'TEXT',
              required: q.required ?? false,
              placeholder: q.placeholder,
              options: q.options ?? [],
              order: q.order ?? maxOrder + index,
            })),
          });
        }

        // Fetch updated hackathon with questions
        return await tx.hackathon.findUnique({
          where: { id: hackathon.id },
          include: {
            category: true,
            registrationQuestions: { orderBy: { order: 'asc' } },
          },
        });
      }

      return updated;
    });

    return {
      message: 'Hackathon updated successfully',
      data: updatedHackathon,
    };
  }

  async manageTracks(
    hackathonIdentifier: string,
    userId: string,
    manageTracksDto: ManageTracksDto,
  ) {
    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: hackathonIdentifier }, { slug: hackathonIdentifier }],
      },
      include: { organization: true },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (hackathon.organization.ownerId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to manage tracks for this hackathon',
      );
    }

    const { tracks } = manageTracksDto;
    const hackathonId = hackathon.id;

    // Get existing tracks
    const existingTracks = await this.prisma.track.findMany({
      where: { hackathonId },
    });

    const existingTrackIds = existingTracks.map((t) => t.id);
    const incomingTrackIds = tracks
      .filter((t) => t.id)
      .map((t) => t.id as string);

    // Identify tracks to delete (exist in DB but not in incoming list)
    const tracksToDelete = existingTrackIds.filter(
      (id) => !incomingTrackIds.includes(id),
    );

    // Identify tracks to update (exist in both)
    const tracksToUpdate = tracks.filter(
      (t) => t.id && existingTrackIds.includes(t.id),
    );

    // Identify tracks to create (no id)
    const tracksToCreate = tracks.filter((t) => !t.id);

    // Execute in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete
      if (tracksToDelete.length > 0) {
        await tx.track.deleteMany({
          where: {
            id: { in: tracksToDelete },
            hackathonId, // Safety check
          },
        });
      }

      // Update
      for (const track of tracksToUpdate) {
        await tx.track.update({
          where: { id: track.id },
          data: {
            name: track.name,
            description: track.description,
            judgingCriteria: track.judgingCriteria,
            order: track.order,
            winnersCount: track.winnersCount,
          },
        });
      }

      // Create
      if (tracksToCreate.length > 0) {
        await tx.track.createMany({
          data: tracksToCreate.map((t) => ({
            hackathonId,
            name: t.name,
            description: t.description,
            judgingCriteria: t.judgingCriteria,
            order: t.order,
            winnersCount: t.winnersCount,
          })),
        });
      }
    });

    // Return updated list
    const updatedTracks = await this.prisma.track.findMany({
      where: { hackathonId },
      orderBy: { order: 'asc' },
    });

    return {
      message: 'Tracks updated successfully',
      data: updatedTracks,
    };
  }

  async getTracks(hackathonIdentifier: string, user?: UserMin) {
    const userId = user ? user.id : undefined;
    const isAdmin = user ? user.role === UserRole.ADMIN : false;

    // Find hackathon by id or slug
    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: hackathonIdentifier }, { slug: hackathonIdentifier }],
      },
      select: {
        id: true,
        status: true,
        organization: { select: { ownerId: true } },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check authorization
    const isOwner = userId && hackathon.organization.ownerId === userId;
    const isActive = hackathon.status === HackathonStatus.ACTIVE;

    // Allow: admin, owner, or anyone if not draft/cancelled
    if (!isAdmin && !isOwner && !isActive) {
      throw new NotFoundException('Hackathon access denied');
    }

    const tracks = await this.prisma.track.findMany({
      where: { hackathonId: hackathon.id },
      orderBy: { order: 'asc' },
      include: {
        prizes: true,
      },
    });

    return {
      data: tracks,
    };
  }

  async getHackathonByIdentifier(identifier: string, user?: UserMin) {
    const userId = user ? user.id : undefined;
    const isAdmin = user ? user.role === UserRole.ADMIN : false;

    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        AND: [
          isAdmin
            ? {} // admin can access all hackathons
            : {
                OR: [
                  {
                    status: HackathonStatus.ACTIVE,
                  }, // ONLY ACTIVE hackathons for public
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
                    : []), // if logged in, show hackathon draft and cancelled only if user is owner
                ],
              },
        ],
      },
      include: {
        tracks: true,
        bounties: true,
        prizes: true,
        category: true,
        organization: {
          include: {
            owner: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found or access denied');
    }

    return hackathon;
  }

  async manageSponsors(
    hackathonIdentifier: string,
    userId: string,
    manageSponsorsDto: ManageSponsorsDto,
  ) {
    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: hackathonIdentifier }, { slug: hackathonIdentifier }],
      },
      include: { organization: true },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    if (hackathon.organization.ownerId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to manage sponsors for this hackathon',
      );
    }

    const { sponsors } = manageSponsorsDto;
    const hackathonId = hackathon.id;

    // Get existing sponsors
    const existingSponsors = await this.prisma.sponsor.findMany({
      where: { hackathonId },
      orderBy: { createdAt: 'asc' },
    });

    // Find the organization sponsor (should be the first one)
    const orgSponsor = existingSponsors.find((s) => s.isCurrentOrganization);

    // Validate that the first sponsor in the incoming list matches the org sponsor
    if (orgSponsor && sponsors.length > 0) {
      const firstIncoming = sponsors[0];
      if (firstIncoming.id && firstIncoming.id !== orgSponsor.id) {
        throw new BadRequestException(
          'The first sponsor must be the organization sponsor',
        );
      }
      // Prevent name changes for organization sponsor
      if (firstIncoming.name !== orgSponsor.name) {
        throw new BadRequestException(
          'Organization sponsor name cannot be changed',
        );
      }
    }

    const existingSponsorIds = existingSponsors.map((s) => s.id);
    const incomingIds = sponsors.filter((s) => s.id).map((s) => s.id as string);

    // Identify sponsors to delete (exist in DB but not in incoming list)
    // Never delete the organization sponsor
    const sponsorsToDelete = existingSponsorIds.filter(
      (id) => !incomingIds.includes(id) && id !== orgSponsor?.id,
    );

    // Identify sponsors to update (exist in both)
    const sponsorsToUpdate = sponsors.filter(
      (s) => s.id && existingSponsorIds.includes(s.id),
    );

    // Identify sponsors to create (no id, excluding the org sponsor if it exists)
    const sponsorsToCreate = sponsors.filter((s) => !s.id);

    // Execute in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete
      if (sponsorsToDelete.length > 0) {
        await tx.sponsor.deleteMany({
          where: {
            id: { in: sponsorsToDelete },
            hackathonId, // Safety check
          },
        });
      }

      // Update
      for (const sponsor of sponsorsToUpdate) {
        const isOrgSponsor = sponsor.id === orgSponsor?.id;

        // For organization sponsor, only update logo
        if (isOrgSponsor) {
          await tx.sponsor.update({
            where: { id: sponsor.id },
            data: {
              logo: sponsor.logo,
            },
          });
        } else {
          // For other sponsors, update all fields
          await tx.sponsor.update({
            where: { id: sponsor.id },
            data: {
              name: sponsor.name,
              logo: sponsor.logo,
            },
          });
        }
      }

      // Create
      if (sponsorsToCreate.length > 0) {
        await tx.sponsor.createMany({
          data: sponsorsToCreate.map((s) => ({
            hackathonId,
            name: s.name,
            logo: s.logo,
            isCurrentOrganization: false,
          })),
        });
      }
    });

    // Return updated list
    const updatedSponsors = await this.prisma.sponsor.findMany({
      where: { hackathonId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      message: 'Sponsors updated successfully',
      data: updatedSponsors,
    };
  }

  async getSponsors(hackathonIdentifier: string, user?: UserMin) {
    const userId = user ? user.id : undefined;
    const isAdmin = user ? user.role === UserRole.ADMIN : false;

    // Find hackathon by id or slug
    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: hackathonIdentifier }, { slug: hackathonIdentifier }],
      },
      select: {
        id: true,
        status: true,
        organization: { select: { ownerId: true } },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check authorization
    const isOwner = userId ? userId === hackathon.organization.ownerId : false;
    const isActive = hackathon.status === HackathonStatus.ACTIVE;

    // Allow: admin, owner, or anyone if it is active
    if (!isAdmin && !isOwner && !isActive) {
      throw new NotFoundException('Hackathon access denied');
    }

    const sponsors = await this.prisma.sponsor.findMany({
      where: { hackathonId: hackathon.id },
      orderBy: { createdAt: 'asc' },
    });

    return {
      data: sponsors,
    };
  }

  async publishHackathon(hackathonIdentifier: string, userId: string) {
    // Find hackathon by id or slug
    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: hackathonIdentifier }, { slug: hackathonIdentifier }],
      },
      include: {
        organization: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if user is owner of the hackathon's organization
    if (hackathon.organization.ownerId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to publish this hackathon',
      );
    }

    // Check if hackathon is in DRAFT status
    if (hackathon.status !== HackathonStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot publish hackathon. Current status is ${hackathon.status}. Only hackathons in DRAFT status can be published`,
      );
    }

    // Validate required fields before publishing
    if (!hackathon.title || hackathon.title.trim() === '') {
      throw new BadRequestException('Hackathon title is required');
    }

    if (!hackathon.description || hackathon.description.trim() === '') {
      throw new BadRequestException('Hackathon description is required');
    }

    if (!hackathon.registrationStart) {
      throw new BadRequestException('Registration start date is required');
    }

    if (!hackathon.registrationEnd) {
      throw new BadRequestException('Registration end date is required');
    }

    if (!hackathon.startDate) {
      throw new BadRequestException('Hackathon start date is required');
    }

    if (!hackathon.endDate) {
      throw new BadRequestException('Hackathon end date is required');
    }

    // Validat that the hackathon registration start date is in the future (1 day from now at least)
    if (
      hackathon.registrationStart < new Date(Date.now() + 24 * 60 * 60 * 1000)
    ) {
      throw new BadRequestException(
        'Registration start date must be in the future (at least 24 hours from now)',
      );
    }

    // Validate date logic
    if (hackathon.registrationStart >= hackathon.registrationEnd) {
      throw new BadRequestException(
        'Registration start date must be before registration end date',
      );
    }

    if (hackathon.startDate >= hackathon.endDate) {
      throw new BadRequestException(
        'Hackathon start date must be before end date',
      );
    }

    if (hackathon.registrationEnd > hackathon.startDate) {
      throw new BadRequestException(
        'Registration must end before or when the hackathon starts',
      );
    }

    // Validate judging dates if provided
    if (!hackathon.judgingStart && hackathon.judgingEnd) {
      throw new BadRequestException(
        'Judging end date cannot exist without a judging start date',
      );
    }

    if (!hackathon.judgingEnd && hackathon.judgingStart) {
      throw new BadRequestException(
        'Judging start date cannot exist without a judging end date',
      );
    }

    // Validate judging dates if provided
    if (hackathon.judgingStart) {
      if (hackathon.judgingStart < hackathon.endDate) {
        throw new BadRequestException(
          'Judging start date must be after or equal to hackathon end date',
        );
      }

      if (hackathon.judgingEnd) {
        if (hackathon.judgingStart >= hackathon.judgingEnd) {
          throw new BadRequestException(
            'Judging start date must be before judging end date',
          );
        }
      }
    }

    // Validate winner announcement date if provided
    if (hackathon.winnerAnnouncementDate) {
      if (hackathon.judgingEnd) {
        if (hackathon.winnerAnnouncementDate < hackathon.judgingEnd) {
          throw new BadRequestException(
            'Winner announcement date must be after judging end date',
          );
        }
      } else if (hackathon.judgingStart) {
        if (hackathon.winnerAnnouncementDate < hackathon.judgingStart) {
          throw new BadRequestException(
            'Winner announcement date must be after judging start date',
          );
        }
      } else {
        if (hackathon.winnerAnnouncementDate < hackathon.endDate) {
          throw new BadRequestException(
            'Winner announcement date must be after hackathon end date',
          );
        }
      }
    }

    const newStatus = HackathonStatus.ACTIVE;

    // Update hackathon status
    const updatedHackathon = await this.prisma.hackathon.update({
      where: { id: hackathon.id },
      data: { status: newStatus },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        organizationId: true,
        registrationStart: true,
        registrationEnd: true,
        startDate: true,
        endDate: true,
      },
    });

    this.logger.log(
      `Hackathon ${hackathon.id} published with status ${newStatus}`,
    );

    return {
      message: 'Hackathon published successfully',
      data: updatedHackathon,
    };
  }

  // TODO: Implement unarchiveHackathon method
  // Question: Should unarchived hackathon go back to DRAFT or ACTIVE status?
  // - DRAFT: Safer, owner must re-publish after updating dates
  // - ACTIVE: Direct, but dates might be in the past
  // Consider: Maybe require dates to be updated before unarchiving?

  /**
   * Archive a hackathon (organization owner only).
   * DRAFT hackathons can be archived anytime.
   * ACTIVE hackathons can be archived if:
   * - Not started yet (before registrationStart), OR
   * - Everything is done (after endDate and judgingEnd if provided)
   * @param identifier - Hackathon ID or slug
   * @param userId - ID of the user requesting the archive
   * @returns The archived hackathon
   */
  async archiveHackathon(identifier: string, userId: string) {
    // Find hackathon by ID or slug
    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        organization: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if user is the organization owner
    if (hackathon.organization.ownerId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to archive this hackathon',
      );
    }

    // Check if status allows archiving (only DRAFT or ACTIVE)
    if (
      hackathon.status !== HackathonStatus.DRAFT &&
      hackathon.status !== HackathonStatus.ACTIVE
    ) {
      throw new BadRequestException(
        `Cannot archive hackathon with status ${hackathon.status}. Only DRAFT or ACTIVE hackathons can be archived.`,
      );
    }

    // For ACTIVE hackathons, check timing restrictions
    if (hackathon.status === HackathonStatus.ACTIVE) {
      const now = new Date();

      // Check if hackathon has not started yet (can archive before it starts)
      const notStartedYet = now < hackathon.registrationStart;

      // Determine the "true end" of the hackathon
      // If judgingEnd exists, that's the actual end; otherwise use endDate
      const trueEndDate = hackathon.judgingEnd || hackathon.endDate;
      const everythingDone = now > trueEndDate;

      // Can only archive if not started yet OR everything is done
      if (!notStartedYet && !everythingDone) {
        // Determine what period we're in for a helpful error message
        if (now >= hackathon.registrationStart && now <= hackathon.endDate) {
          throw new BadRequestException(
            'Cannot archive hackathon while it is in progress. Wait until the hackathon ends.',
          );
        }
        if (
          hackathon.judgingStart &&
          hackathon.judgingEnd &&
          now >= hackathon.judgingStart &&
          now <= hackathon.judgingEnd
        ) {
          throw new BadRequestException(
            'Cannot archive hackathon while judging is in progress. Wait until judging ends.',
          );
        }
        // In the gap between endDate and judgingStart
        if (hackathon.judgingEnd && now > hackathon.endDate) {
          throw new BadRequestException(
            'Cannot archive hackathon before judging period is complete. Wait until judging ends.',
          );
        }
      }
    }

    // Archive the hackathon
    const archivedHackathon = await this.prisma.hackathon.update({
      where: { id: hackathon.id },
      data: {
        status: HackathonStatus.ARCHIVED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        organizationId: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(
      `Hackathon ${hackathon.id} (${hackathon.title}) archived by owner ${userId}`,
    );

    return {
      message: 'Hackathon archived successfully',
      data: archivedHackathon,
    };
  }

  async getHackathonWinners(hackathonIdentifier: string, user?: UserMin) {
    const userId = user?.id;
    const isAdmin = user?.role === UserRole.ADMIN;

    // Find hackathon by id or slug
    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: hackathonIdentifier }, { slug: hackathonIdentifier }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        isPrivate: true,
        organization: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check authorization
    const isOwner = userId && hackathon.organization.ownerId === userId;
    const isActive = hackathon.status === HackathonStatus.ACTIVE;

    // For private hackathons, check if user is registered
    let isRegistered = false;
    if (hackathon.isPrivate && userId) {
      const registration = await this.prisma.hackathonRegistration.findUnique({
        where: {
          hackathonId_userId: {
            hackathonId: hackathon.id,
            userId,
          },
        },
      });
      isRegistered = !!registration;
    }

    // Access control:
    // - Admin can access all
    // - Owner can access all
    // - For active hackathons: anyone can access
    // - For private hackathons: only registered users can access
    // - For non-active hackathons: only admin or owner can access
    if (!isAdmin && !isOwner) {
      if (hackathon.isPrivate && !isRegistered) {
        throw new NotFoundException(
          'You are not registered for this private hackathon',
        );
      }
      if (!isActive) {
        throw new NotFoundException('Hackathon access denied');
      }
    }

    // Fetch all prize winners for this hackathon with comprehensive details
    const prizeWinners = await this.prisma.prizeWinner.findMany({
      where: {
        prize: {
          hackathonId: hackathon.id,
        },
      },
      include: {
        prize: {
          include: {
            track: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            bounty: {
              select: {
                id: true,
                title: true,
                description: true,
                sponsorId: true,
                sponsor: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                },
              },
            },
          },
        },
        submission: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                      },
                    },
                  },
                },
              },
            },
            track: {
              select: {
                id: true,
                name: true,
              },
            },
            bounty: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          prize: {
            type: 'asc',
          },
        },
        {
          prize: {
            position: 'asc',
          },
        },
      ],
    });

    return {
      hackathon: {
        id: hackathon.id,
        title: hackathon.title,
        slug: hackathon.slug,
        organization: hackathon.organization,
      },
      winners: prizeWinners,
      totalWinners: prizeWinners.length,
    };
  }
}
