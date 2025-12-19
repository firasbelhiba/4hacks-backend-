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
import {
  HackathonStatus,
  UserRole,
  PrizeType,
  SubmissionStatus,
} from '@prisma/client';
import { MAX_WINNERS_BY_BOUNTY, MAX_WINNERS_BY_TRACK } from '../constants';
import { ManageBountyPrizesDto } from './dto/manage-bounty.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { SetPrizeWinnerDto } from './dto/set-prize-winner.dto';

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

  async setPrizeWinner(
    prizeId: string,
    setPrizeWinnerDto: SetPrizeWinnerDto,
    user: UserMin,
  ) {
    const { submissionId } = setPrizeWinnerDto;

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
        prizeWinner: {
          include: {
            submission: {
              select: {
                id: true,
                title: true,
                teamId: true,
              },
            },
          },
        },
      },
    });

    if (!prize) {
      throw new NotFoundException('Prize not found');
    }

    // Check authorization - only admin or organization owner can set winners
    const isAdmin = user.role === UserRole.ADMIN;
    const isOrganizer = user.id === prize.hackathon.organization.ownerId;

    if (!isAdmin && !isOrganizer) {
      throw new ForbiddenException(
        'You are not allowed to set winners for this prize',
      );
    }

    // NOTE: A prize can only have one winner.
    if (prize.prizeWinner) {
      throw new BadRequestException('This prize already has a winner.');
    }

    // Check if the hackathon is ended
    const now = new Date();
    if (prize.hackathon.winnerAnnouncementDate) {
      if (now < prize.hackathon.winnerAnnouncementDate) {
        throw new BadRequestException(
          'The hackathon winner announcement date has not passed yet. You cannot set winners for prizes.',
        );
      }
    } else if (prize.hackathon.endDate > now) {
      throw new BadRequestException(
        'The hackathon is not ended yet. You cannot set winners for prizes.',
      );
    }

    // Validate that the submission exists and belongs to the same hackathon
    const submission = await this.prismaService.submission.findUnique({
      where: {
        id: submissionId,
      },
      select: {
        id: true,
        hackathonId: true,
        trackId: true,
        submissionBounties: {
          select: {
        bountyId: true,
          },
        },
        status: true,
        title: true,
        hackathon: {
          select: {
            title: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Ensure submission belongs to the same hackathon
    if (submission.hackathonId !== prize.hackathonId) {
      throw new BadRequestException(
        'Submission does not belong to the same hackathon as the prize',
      );
    }

    // Ensure submission is submitted (not draft, withdrawn, or rejected)
    if (submission.status !== SubmissionStatus.SUBMITTED) {
      throw new BadRequestException(
        `Cannot set winner for a submission with status: ${submission.status}. Only SUBMITTED submissions can win prizes.`,
      );
    }

    // For track prizes, ensure submission is in the same track
    if (prize.type === PrizeType.TRACK && prize.trackId) {
      if (submission.trackId !== prize.trackId) {
        throw new BadRequestException(
          'Submission is not participating in the same track as this prize',
        );
      }
    }

    // For bounty prizes, ensure submission is participating in the same bounty
    if (prize.type === PrizeType.BOUNTY && prize.bountyId) {
      const isParticipatingInBounty = submission.submissionBounties.some(
        (sb) => sb.bountyId === prize.bountyId,
      );
      if (!isParticipatingInBounty) {
        throw new BadRequestException(
          'Submission is not participating in the same bounty as this prize',
        );
      }
    }

    // // Check if this submission is already a winner of this prize
    // const existingWinner = prize.prizeWinner?.submissionId === submissionId;

    // if (existingWinner) {
    //   throw new BadRequestException(
    //     'This submission is already set as the winner for this prize',
    //   );
    // }

    // Create the prize winner record
    const prizeWinner = await this.prismaService.$transaction(async (tx) => {
      const prizeWinner = await tx.prizeWinner.create({
        data: {
          prizeId,
          submissionId,
        },
        include: {
          submission: {
            select: {
              id: true,
              title: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              team: {
                select: {
                  id: true,
                  name: true,
                  members: {
                    select: {
                      id: true,
                      userId: true,
                      isLeader: true,
                    },
                  },
                },
              },
            },
          },
          prize: {
            select: {
              id: true,
              name: true,
              position: true,
              amount: true,
              token: true,
              type: true,
            },
          },
        },
      });

      // Update the submission's isWinner flag
      await tx.submission.update({
        where: {
          id: submissionId,
        },
        data: {
          isWinner: true,
        },
      });

      // Set a notfication to the submission owner
      await tx.notification.create({
        data: {
          toUserId: prizeWinner.submission.creator.id,
          type: 'PRIZE_WINNER',
          content: `Congratulations! You have won the prize ${prizeWinner.prize.name} for the submission ${prizeWinner.submission.title} in the hackathon ${submission.hackathon.title}`,
          payload: {
            prizeId: prizeWinner.prize.id,
            submissionId: prizeWinner.submission.id,
            hackathonId: submission.hackathonId,
          },
        },
      });

      return prizeWinner;
    });

    return {
      message: 'Prize winner set successfully',
      data: prizeWinner,
    };
  }
}
