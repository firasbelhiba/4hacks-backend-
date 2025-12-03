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
import { HackathonStatus, UserRole } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { UserMin } from 'src/common/types';

@Injectable()
export class HackathonService {
  private readonly logger = new Logger(HackathonService.name);

  constructor(private readonly prisma: PrismaService) {}

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

    // Prepare update data
    const updateData: any = { ...updateHackathonDto };

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

    // Update hackathon
    const updatedHackathon = await this.prisma.hackathon.update({
      where: {
        id: hackathon.id,
      },
      data: updateData,
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
}
