import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityTargetType, UserMin } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamPositionDto } from './dto/create.dto';

@Injectable()
export class TeamPositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    hackathonId: string,
    teamId: string,
    createTeamPositionDto: CreateTeamPositionDto,
    requesterUser: UserMin,
  ) {
    const { title, description, requiredSkills } = createTeamPositionDto;

    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        hackathon: {
          select: {
            id: true,
            maxTeamSize: true,
          },
        },
        members: {
          select: {
            id: true,
            userId: true,
            isLeader: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.hackathonId !== hackathonId) {
      throw new BadRequestException('Team is not associated to the hackathon');
    }

    // Check team members length is not more than hackathon max team length
    if (team.members.length >= team.hackathon.maxTeamSize) {
      throw new BadRequestException(
        'Team is full. Max team size is ' + team.hackathon.maxTeamSize,
      );
    }

    // Check if requester user is the leader of the team
    const isLeader = team.members.some(
      (member) => member.userId === requesterUser.id && member.isLeader,
    );

    if (!isLeader) {
      throw new ForbiddenException('You are not the leader of this team');
    }

    const teamPosition = await this.prisma.$transaction(async (tx) => {
      const teamPosition = await tx.teamPosition.create({
        data: {
          title,
          description,
          requiredSkills,
          teamId,
          createdById: requesterUser.id,
        },
      });

      // Store the activity logs
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'CREATE_TEAM_POSITION',
          isPublic: true,
          description: `Created team position ${title} for team ${team.name}`,
          targetType: ActivityTargetType.TEAM_POSITION.toString(),
          targetId: teamPosition.id,
        },
      });

      return teamPosition;
    });

    return teamPosition;
  }
}
