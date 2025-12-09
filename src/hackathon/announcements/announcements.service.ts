import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create.dto';
import { HackathonMin, UserMin } from 'src/common/types';
import { AnnouncementTargetType } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAnnouncement(
    hackathon: HackathonMin,
    announcementData: CreateAnnouncementDto,
    requesterUser: UserMin,
  ) {
    const { trackId, bountyId } = announcementData;

    // Check that the requester is the owner of the hackathon
    if (requesterUser.id !== hackathon.organization.ownerId) {
      throw new ForbiddenException(
        'You are not authorized to create an announcement for this hackathon',
      );
    }

    // Check if trackId (if porvided) is valid
    if (trackId) {
      // Check if targetType is TRACK
      if (announcementData.targetType !== AnnouncementTargetType.TRACK) {
        throw new BadRequestException(
          'Target type must be TRACK if trackId is provided',
        );
      }

      // Check if track exists
      const track = await this.prismaService.track.findUnique({
        where: {
          id: trackId,
        },
        select: {
          hackathonId: true,
        },
      });

      if (!track) {
        throw new NotFoundException('Track not found');
      }

      if (track.hackathonId !== hackathon.id) {
        throw new ConflictException("Track doesn't belong to this hackathon");
      }
    }

    // Check if bountyId (if porvided) is valid
    if (bountyId) {
      // Check if targetType is BOUNTY
      if (announcementData.targetType !== AnnouncementTargetType.BOUNTY) {
        throw new BadRequestException(
          'Target type must be BOUNTY if bountyId is provided',
        );
      }

      const bounty = await this.prismaService.bounty.findUnique({
        where: {
          id: bountyId,
        },
        select: {
          hackathonId: true,
        },
      });

      if (!bounty) {
        throw new NotFoundException('Bounty not found');
      }

      if (bounty.hackathonId !== hackathon.id) {
        throw new ConflictException("Bounty doesn't belong to this hackathon");
      }
    }

    const announcement = await this.prismaService.$transaction(async (tx) => {
      const announcement = await tx.announcement.create({
        data: {
          hackathonId: hackathon.id,
          ...announcementData,
          createdById: requesterUser.id,
        },
      });

      // Store activbity logs
      await tx.userActivityLog.create({
        data: {
          description: `Created announcement ${announcement.title} in hackathon ${hackathon.title}`,
          userId: requesterUser.id,
          isPublic: false,
          action: 'CREATE_ANNOUNCEMENT',
          targetId: announcement.id,
        },
      });

      return announcement;
    });

    return {
      message: 'Announcement created successfully',
      announcement,
    };
  }
}
