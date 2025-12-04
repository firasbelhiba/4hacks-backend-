import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ManageTrackPrizesDto } from './dto/manage-track.dto';
import { UserMin } from 'src/common/types';
import { HackathonStatus, UserRole, PrizeType } from 'generated/prisma';
import { MAX_WINNERS_BY_BOUNTY, MAX_WINNERS_BY_TRACK } from '../constants';
import { ManageBountyPrizesDto } from './dto/manage-bounty.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';

@Injectable()
export class PrizesService {
  private readonly logger = new Logger(PrizesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getTrackPrizes(trackId: string, user?: UserMin) {
    // Check if the track exists
    const track = await this.prismaService.track.findUnique({
      where: {
        id: trackId,
      },
      select: {
        hackathon: {
          select: {
            id: true,
            status: true,
            isPrivate: true,
            organization: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const isAdmin = user?.role === UserRole.ADMIN;
    const isOrganizer = user?.id === track.hackathon.organization.ownerId;

    // Check if user is registered in the hackathon
    let isRegistered: boolean = false;

    if (track.hackathon.isPrivate && user) {
      const userRegistration =
        await this.prismaService.hackathonRegistration.findUnique({
          where: {
            hackathonId_userId: {
              hackathonId: track.hackathon.id,
              userId: user.id,
            },
          },
        });

      // isRegistred is true if the user is registered in the hackathon
      isRegistered = !!userRegistration;
    }

    // Check if user is allowed to manage prizes
    if (!isAdmin && !isOrganizer) {
      if (track.hackathon.isPrivate && !isRegistered) {
        throw new ForbiddenException(
          'You are not registered for this private hackathon',
        );
      }
      if (track.hackathon.status !== HackathonStatus.ACTIVE) {
        throw new ForbiddenException('Hackathon is not active');
      }
    }

    // Return prizes of the track ordered by position
    return this.prismaService.prize.findMany({
      where: {
        trackId,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async manageTrackPrizes(
    trackId: string,
    ManageTrackPrizesDto: ManageTrackPrizesDto,
    user: UserMin,
  ) {
    // Check if the track exists
    const track = await this.prismaService.track.findUnique({
      where: {
        id: trackId,
      },
      select: {
        hackathon: {
          select: {
            id: true,
            status: true,
            isPrivate: true,
            organization: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const isOrganizer = user.id === track.hackathon.organization.ownerId;

    if (!isOrganizer) {
      throw new ForbiddenException(
        'You are not allowed to manage track prizes',
      );
    }

    const { prizes } = ManageTrackPrizesDto;
    const hackathonId = track.hackathon.id;

    // Validate max prizes
    if (prizes.length > MAX_WINNERS_BY_TRACK) {
      throw new BadRequestException(
        `You can only have a maximum of ${MAX_WINNERS_BY_TRACK} prizes per track`,
      );
    }

    // Get existing prizes
    const existingPrizes = await this.prismaService.prize.findMany({
      where: {
        trackId,
      },
    });

    const existingPrizeIds = existingPrizes.map((p) => p.id);
    const incomingPrizeIds = prizes
      .filter((p) => p.id)
      .map((p) => p.id as string);

    // Identify prizes to delete (exist in DB but not in incoming list)
    const prizesToDelete = existingPrizeIds.filter(
      (id) => !incomingPrizeIds.includes(id),
    );

    // Identify prizes to update (exist in both)
    const prizesToUpdate = prizes.filter(
      (p) => p.id && existingPrizeIds.includes(p.id),
    );

    // Identify prizes to create (no id)
    const prizesToCreate = prizes.filter((p) => !p.id);

    // Check if there is duplicate position
    const positions = prizes.map((p) => p.position);
    const uniquePositions = new Set(positions);

    if (positions.length !== uniquePositions.size) {
      throw new BadRequestException('Duplicate positions found');
    }

    // Execute in transaction
    await this.prismaService.$transaction(async (tx) => {
      // Delete
      if (prizesToDelete.length > 0) {
        await tx.prize.deleteMany({
          where: {
            id: { in: prizesToDelete },
            trackId, // Safety check
          },
        });
      }

      // Update
      for (const prize of prizesToUpdate) {
        await tx.prize.update({
          where: { id: prize.id },
          data: {
            position: prize.position,
            name: prize.name,
            amount: prize.amount,
            token: prize.token,
            type: PrizeType.TRACK, // Ensure type is TRACK
            // trackId is already set
          },
        });
      }

      // Create
      if (prizesToCreate.length > 0) {
        await tx.prize.createMany({
          data: prizesToCreate.map((p) => ({
            hackathonId,
            trackId,
            position: p.position,
            name: p.name,
            amount: p.amount,
            token: p.token,
            type: PrizeType.TRACK,
          })),
        });
      }
    });

    // Return updated list
    return this.prismaService.prize.findMany({
      where: {
        trackId,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async getBountyPrizes(bountyId: string, user?: UserMin) {
    // Check if the bounty exists
    const bounty = await this.prismaService.bounty.findUnique({
      where: {
        id: bountyId,
      },
      select: {
        hackathon: {
          select: {
            id: true,
            status: true,
            isPrivate: true,
            organization: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!bounty) {
      throw new NotFoundException('Bounty not found');
    }

    const isAdmin = user?.role === UserRole.ADMIN;
    const isOrganizer = user?.id === bounty.hackathon.organization.ownerId;

    // Check if user is registered in the hackathon
    let isRegistered: boolean = false;

    if (bounty.hackathon.isPrivate && user) {
      const userRegistration =
        await this.prismaService.hackathonRegistration.findUnique({
          where: {
            hackathonId_userId: {
              hackathonId: bounty.hackathon.id,
              userId: user.id,
            },
          },
        });

      // isRegistred is true if the user is registered in the hackathon
      isRegistered = !!userRegistration;
    }

    // Check if user is allowed to manage prizes
    if (!isAdmin && !isOrganizer) {
      if (bounty.hackathon.isPrivate && !isRegistered) {
        throw new ForbiddenException(
          'You are not registered for this private hackathon',
        );
      }
      if (bounty.hackathon.status !== HackathonStatus.ACTIVE) {
        throw new ForbiddenException('Hackathon is not active');
      }
    }

    // Return prizes of the bounty ordered by position
    return this.prismaService.prize.findMany({
      where: {
        bountyId,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async manageBountyPrizes(
    bountyId: string,
    ManageBountyPrizesDto: ManageBountyPrizesDto,
    user: UserMin,
  ) {
    const { prizes } = ManageBountyPrizesDto;

    // Check if the bounty exists
    const bounty = await this.prismaService.bounty.findUnique({
      where: {
        id: bountyId,
      },
      select: {
        hackathon: {
          select: {
            id: true,
            status: true,
            isPrivate: true,
            organization: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!bounty) {
      throw new NotFoundException('Bounty not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isOrganizer = user.id === bounty.hackathon.organization.ownerId;

    // Check if user is registered in the hackathon
    let isRegistered: boolean = false;

    if (bounty.hackathon.isPrivate && user) {
      const userRegistration =
        await this.prismaService.hackathonRegistration.findUnique({
          where: {
            hackathonId_userId: {
              hackathonId: bounty.hackathon.id,
              userId: user.id,
            },
          },
        });

      // isRegistred is true if the user is registered in the hackathon
      isRegistered = !!userRegistration;
    }

    // Check if user is allowed to manage prizes
    if (!isAdmin && !isOrganizer) {
      if (bounty.hackathon.isPrivate && !isRegistered) {
        throw new ForbiddenException(
          'You are not registered for this private hackathon',
        );
      }
      if (bounty.hackathon.status !== HackathonStatus.ACTIVE) {
        throw new ForbiddenException('Hackathon is not active');
      }
    }

    // Validate max prizes
    if (prizes.length > MAX_WINNERS_BY_BOUNTY) {
      throw new BadRequestException(
        `You can only have a maximum of ${MAX_WINNERS_BY_BOUNTY} prizes per bounty`,
      );
    }

    // Get existing prizes
    const existingPrizes = await this.prismaService.prize.findMany({
      where: {
        bountyId,
      },
    });

    const existingPrizeIds = existingPrizes.map((p) => p.id);
    const incomingPrizeIds = prizes
      .filter((p) => p.id)
      .map((p) => p.id as string);

    // Identify prizes to delete (exist in DB but not in incoming list)
    const prizesToDelete = existingPrizeIds.filter(
      (id) => !incomingPrizeIds.includes(id),
    );

    // Identify prizes to update (exist in both)
    const prizesToUpdate = prizes.filter(
      (p) => p.id && existingPrizeIds.includes(p.id),
    );

    // Identify prizes to create (no id)
    const prizesToCreate = prizes.filter((p) => !p.id);

    // Check if there is duplicate position
    const positions = prizes.map((p) => p.position);
    const uniquePositions = new Set(positions);

    if (positions.length !== uniquePositions.size) {
      throw new BadRequestException('Duplicate positions found');
    }

    // Execute in transaction
    await this.prismaService.$transaction(async (tx) => {
      // Delete
      if (prizesToDelete.length > 0) {
        await tx.prize.deleteMany({
          where: {
            id: { in: prizesToDelete },
            bountyId, // Safety check
          },
        });
      }

      // Update
      for (const prize of prizesToUpdate) {
        await tx.prize.update({
          where: { id: prize.id },
          data: {
            position: prize.position,
            name: prize.name,
            amount: prize.amount,
            token: prize.token,
            type: PrizeType.BOUNTY, // Ensure type is BOUNTY
            // bountyId is already set
          },
        });
      }

      // Create
      if (prizesToCreate.length > 0) {
        await tx.prize.createMany({
          data: prizesToCreate.map((p) => ({
            hackathonId: bounty.hackathon.id,
            bountyId,
            position: p.position,
            name: p.name,
            amount: p.amount,
            token: p.token,
            type: PrizeType.BOUNTY,
          })),
        });
      }
    });

    // Return updated list
    return this.prismaService.prize.findMany({
      where: {
        bountyId,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async updatePrize(
    prizeId: string,
    updatePrizeDto: UpdatePrizeDto,
    user: UserMin,
  ) {
    // Find the prize with its related hackathon and organization info
    const prize = await this.prismaService.prize.findUnique({
      where: {
        id: prizeId,
      },
      include: {
        hackathon: {
          include: {
            organization: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
        track: true,
        bounty: true,
      },
    });

    if (!prize) {
      throw new NotFoundException('Prize not found');
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isOrganizer = user.id === prize.hackathon.organization.ownerId;

    // Check if user is allowed to update the prize
    if (!isAdmin && !isOrganizer) {
      throw new ForbiddenException('You are not allowed to update this prize');
    }

    // If position is being updated, check for duplicates
    if (updatePrizeDto.position !== undefined) {
      const whereClause: any = {
        hackathonId: prize.hackathonId,
        position: updatePrizeDto.position,
        id: { not: prizeId }, // Exclude current prize
      };

      // Add type-specific filters
      if (prize.type === PrizeType.TRACK && prize.trackId) {
        whereClause.trackId = prize.trackId;
        whereClause.type = PrizeType.TRACK;
      } else if (prize.type === PrizeType.BOUNTY && prize.bountyId) {
        whereClause.bountyId = prize.bountyId;
        whereClause.type = PrizeType.BOUNTY;
      }

      const existingPrizeWithPosition =
        await this.prismaService.prize.findFirst({
          where: whereClause,
        });

      if (existingPrizeWithPosition) {
        throw new BadRequestException(
          `A prize with position ${updatePrizeDto.position} already exists for this ${prize.type.toLowerCase()}`,
        );
      }
    }

    // Update the prize
    const updatedPrize = await this.prismaService.prize.update({
      where: {
        id: prizeId,
      },
      data: {
        ...(updatePrizeDto.position !== undefined && {
          position: updatePrizeDto.position,
        }),
        ...(updatePrizeDto.name !== undefined && {
          name: updatePrizeDto.name,
        }),
        ...(updatePrizeDto.amount !== undefined && {
          amount: updatePrizeDto.amount,
        }),
        ...(updatePrizeDto.token !== undefined && {
          token: updatePrizeDto.token,
        }),
      },
    });

    return {
      message: 'Prize updated successfully',
      data: updatedPrize,
    };
  }
}
