import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HackathonContextGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    const hackathonId = req.params.hackathonId;

    if (!hackathonId) return true;

    try {
      const hackathon = await this.prismaService.hackathon.findUnique({
        where: { id: hackathonId },
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          isPrivate: true,
          requiresApproval: true,
          requiredSubmissionMaterials: true,
          organizationId: true,
          registrationStart: true,
          registrationEnd: true,
          startDate: true,
          endDate: true,
          judgingStart: true,
          judgingEnd: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              ownerId: true,
            },
          },
        },
      });

      if (!hackathon) {
        throw new NotFoundException('Hackathon not found');
      }

      // attach to request for later usage
      req.hackathon = hackathon;

      return true;
    } catch (error) {
      console.error('Error fetching hackathon:', error);
      throw new BadRequestException(error.message);
    }
  }
}
