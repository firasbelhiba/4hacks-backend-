import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ManagePrizesDto } from './dto/manage.dto';
import { UserMin } from 'src/common/types';
import { HackathonStatus, UserRole } from 'generated/prisma';

@Injectable()
export class PrizesService {
  private readonly logger = new Logger(PrizesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getPrizes(trackId: string, user?: UserMin) {
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

  async managePrizes(
    trackId: string,
    managePrizesDto: ManagePrizesDto,
    user: UserMin,
  ) {}
}
