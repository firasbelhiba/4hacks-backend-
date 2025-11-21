import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves the profile of a user by their username.
   * @param username - The username of the user.
   * @returns The user's profile.
   */
  async getProfileByUsername(username: string) {
    const profile = await this.prisma.users.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        bio: true,
        image: true,
        profession: true,
        location: true,
        skills: true,
        website: true,
        github: true,
        linkedin: true,
        otherSocials: true,
      },
    });

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    return profile;
  }
}
