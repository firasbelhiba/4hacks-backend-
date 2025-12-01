import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserMin } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamDto } from './dto/create.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ActivityTargetType } from 'generated/prisma';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async createTeam(
    hackathonId: string,
    requesterUser: UserMin,
    createTeamDto: CreateTeamDto,
    imageFile?: Express.Multer.File,
  ) {
    this.logger.log(
      `Creating team for hackathon ${hackathonId} by user ${requesterUser.username}`,
    );

    const { name, tagline } = createTeamDto;

    // Check if hackathon exists
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        organization: {
          select: { name: true, slug: true, ownerId: true },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // Check if the user is registered for the hackathon
    const registration = await this.prisma.hackathonRegistration.findUnique({
      where: {
        hackathonId_userId: { hackathonId, userId: requesterUser.id },
      },
    });

    if (!registration) {
      throw new NotFoundException(
        'You must be registered for the hackathon to create a team',
      );
    }

    // Check if the user is already in a team for this hackathon
    const existingTeamMember = await this.prisma.teamMember.findFirst({
      where: {
        userId: requesterUser.id,
        team: {
          hackathonId: hackathonId,
        },
      },
    });

    if (existingTeamMember) {
      throw new ConflictException(
        'You are already in a team for this hackathon',
      );
    }

    // Check if team name already exists for this hackathon
    const existingTeam = await this.prisma.team.findUnique({
      where: {
        hackathonId_name: { hackathonId, name },
      },
    });

    if (existingTeam) {
      throw new ConflictException(
        'A team with this name already exists for this hackathon',
      );
    }

    // Upload team image if provided
    let imageUrl: string | undefined;

    if (imageFile) {
      imageUrl = await this.fileUploadService.uploadTeamImage(
        imageFile,
        hackathonId,
        name,
      );
    }

    // Create the team
    const team = await this.prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          tagline,
          image: imageUrl,
          hackathonId,
        },
      });

      // Add the creator as a team member
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: requesterUser.id,
          isLeader: true,
        },
      });

      // Store the User Activity Log
      await tx.userActivityLog.create({
        data: {
          userId: requesterUser.id,
          action: 'CREATE_TEAM',
          targetType: ActivityTargetType.HACKATHON,
          targetId: hackathonId,
          description: `created team ${newTeam.name} for hackathon ${hackathon.slug}`,
        },
      });

      // Get the full team object with members
      const fullTeam = await tx.team.findUnique({
        where: { id: newTeam.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return fullTeam;
    });

    return {
      message: 'Team created successfully',
      data: team,
    };
  }
}
