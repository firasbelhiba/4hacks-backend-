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
import { HackathonStatus, UserRole } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { UserMin } from 'src/common/types';

@Injectable()
export class HackathonService {
  private readonly logger = new Logger(HackathonService.name);

  constructor(private readonly prisma: PrismaService) {}

  async update(
    hackathonId: string,
    userId: string,
    updateHackathonDto: UpdateHackathonDto,
  ) {
    // Check if hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: {
        id: hackathonId,
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

    // Update hackathon
    const updatedHackathon = await this.prisma.hackathon.update({
      where: {
        id: hackathonId,
      },
      data: updateData,
    });

    return {
      message: 'Hackathon updated successfully',
      data: updatedHackathon,
    };
  }

  async manageTracks(
    hackathonId: string,
    userId: string,
    manageTracksDto: ManageTracksDto,
  ) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
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

  async getTracks(hackathonId: string) {
    const tracks = await this.prisma.track.findMany({
      where: { hackathonId },
      orderBy: { order: 'asc' },
    });

    return {
      data: tracks,
    };
  }

  async getHackathonByIdentifier(identifier: string, user?: UserMin) {
    const userId = user ? user.id : undefined;

    const hackathon = await this.prisma.hackathon.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        AND: [
          user && user.role === UserRole.ADMIN
            ? {} // admin can access all hackathons
            : {
                OR: [
                  {
                    status: {
                      notIn: [HackathonStatus.DRAFT, HackathonStatus.CANCELLED],
                    },
                  }, // not draft or cancelled hackathons
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

    return {
      message: 'Hackathon retrieved successfully',
      data: hackathon,
    };
  }
}
