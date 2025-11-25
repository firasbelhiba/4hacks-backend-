import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHackathonDto } from './dto/create.dto';
import { UpdateHackathonDto } from './dto/update.dto';
import { ManageTracksDto } from './dto/track.dto';

@Injectable()
export class HackathonService {
  private readonly logger = new Logger(HackathonService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createHackathonDto: CreateHackathonDto) {
    const { organizationId, slug } = createHackathonDto;

    // Check if organization exists
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user is owner of organization
    if (organization.ownerId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to create a hackathon with this organization',
      );
    }

    // Check if hackathon with this slug already exists
    const existingHackathon = await this.prisma.hackathon.findUnique({
      where: {
        slug,
      },
    });

    if (existingHackathon) {
      throw new ConflictException('Hackathon with this slug already exists');
    }

    // Use a transaction so hackathon + track are guaranteed to be created together
    const hackathon = await this.prisma.$transaction(async (tx) => {
      const hackathon = await tx.hackathon.create({
        data: createHackathonDto,
        select: {
          id: true,
          slug: true,
          title: true,
          organizationId: true,
        },
      });

      await tx.track.create({
        data: {
          hackathonId: hackathon.id,
          name: 'Default Track',
          description: 'Default track for hackathon',
        },
      });

      return hackathon;
    });

    return {
      message: 'Hackathon created successfully',
      data: hackathon,
    };
  }

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

    // Update hackathon
    const updatedHackathon = await this.prisma.hackathon.update({
      where: {
        id: hackathonId,
      },
      data: updateHackathonDto,
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
}
