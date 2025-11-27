import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HackathonRequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.hackathonCreationRequest.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            owner: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
              },
            },
          },
        },
        hackathon: true,
        approvedBy: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
        rejectedBy: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
