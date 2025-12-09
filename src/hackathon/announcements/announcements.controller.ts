import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create.dto';
import { UpdateAnnouncementDto } from './dto/update.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { HackathonMin, UserMin } from 'src/common/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { HackathonContextGuard } from '../guards/hackathon.guard';
import { Hackathon } from '../decorators/hackathon.decorator';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';

@ApiParam({
  name: 'hackathonId',
  description: 'ID of the hackathon',
  required: true,
  type: 'string',
})
@ApiTags('Hackathon Announcements')
@Controller('hackathon/:hackathonId/announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @ApiOperation({
    summary: 'Create a new hackathon announcement',
    description:
      'Create a new hackathon announcement. Called only by hackathon organization owner',
  })
  @ApiResponse({
    status: 201,
    description: 'Announcement created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Post()
  async createAnnouncement(
    @Body() announcementData: CreateAnnouncementDto,
    @CurrentUser() requesterUser: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.announcementsService.createAnnouncement(
      hackathon,
      announcementData,
      requesterUser,
    );
  }

  @ApiOperation({
    summary: 'Get hackathon announcements',
    description:
      'Get hackathon announcements. Called only by hackathon organization owner',
  })
  @ApiResponse({
    status: 200,
    description: 'Announcements retrieved successfully',
    example: [
      {
        id: 'cmiyf3kmb0002hsfd7flzxuvn',
        hackathonId: 'cmiy7374m00061cfddii3ek8n',
        createdById: 'cmiy6u0pv00011cfdc1ysaw0o',
        title: 'Announcement Title registred only',
        message: 'Announcement Message',
        image: null,
        link: 'https://example.com',
        visibility: 'REGISTERED_ONLY',
        targetType: 'ALL',
        isPinned: false,
        isDeleted: false,
        trackId: null,
        bountyId: null,
        createdAt: '2025-12-09T10:08:23.075Z',
        updatedAt: '2025-12-09T10:08:23.075Z',
        createdBy: {
          id: 'cmiy6u0pv00011cfdc1ysaw0o',
          name: 'Ayoub Amer',
          username: 'ayoubamer202',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocK7SOqhFn1qNZ0FaSAz7gYEeepk0KHA4SGSJXb_gYhZWgv2s0A=s96-c',
        },
        track: null,
        bounty: null,
      },
      {
        id: 'cmiyf0njk0000hsfddwnvacb1',
        hackathonId: 'cmiy7374m00061cfddii3ek8n',
        createdById: 'cmiy6u0pv00011cfdc1ysaw0o',
        title: 'TEST 1',
        message: "You' re dammnet",
        image: null,
        link: 'https://example.com',
        visibility: 'PUBLIC',
        targetType: 'ALL',
        isPinned: false,
        isDeleted: false,
        trackId: null,
        bountyId: null,
        createdAt: '2025-12-09T10:06:06.895Z',
        updatedAt: '2025-12-09T10:06:06.895Z',
        createdBy: {
          id: 'cmiy6u0pv00011cfdc1ysaw0o',
          name: 'Ayoub Amer',
          username: 'ayoubamer202',
          image:
            'https://lh3.googleusercontent.com/a/ACg8ocK7SOqhFn1qNZ0FaSAz7gYEeepk0KHA4SGSJXb_gYhZWgv2s0A=s96-c',
        },
        track: null,
        bounty: null,
      },
    ],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard, HackathonContextGuard)
  @Get()
  async getHackathonAnnouncements(
    @Hackathon() hackathon: HackathonMin,
    @CurrentUser() requesterUser?: UserMin,
  ) {
    return await this.announcementsService.getHackathonAnnouncements(
      hackathon,
      requesterUser,
    );
  }

  @ApiOperation({
    summary: 'Update an announcement by ID',
    description:
      'Update an existing hackathon announcement. Only the hackathon organization owner can update announcements.',
  })
  @ApiResponse({
    status: 200,
    description: 'Announcement updated successfully',
    example: {
      message: 'Announcement updated successfully',
      announcement: {
        id: 'cmiyf3kmb0002hsfd7flzxuvn',
        hackathonId: 'cmiy7374m00061cfddii3ek8n',
        createdById: 'cmiy6u0pv00011cfdc1ysaw0o',
        title: 'Updated Announcement Title',
        message: 'Updated Announcement Message',
        image: 'https://example.com/image.png',
        link: 'https://example.com',
        visibility: 'PUBLIC',
        targetType: 'ALL',
        isPinned: true,
        isDeleted: false,
        trackId: null,
        bountyId: null,
        createdAt: '2025-12-09T10:08:23.075Z',
        updatedAt: '2025-12-09T11:25:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - User must be authenticated',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Only organization owner can update announcements',
  })
  @ApiNotFoundResponse({
    description: 'Announcement or hackathon not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Patch(':announcementId')
  async updateAnnouncement(
    @Param('announcementId') announcementId: string,
    @Body() updateData: UpdateAnnouncementDto,
    @CurrentUser() requesterUser: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.announcementsService.updateAnnouncement(
      announcementId,
      hackathon,
      updateData,
      requesterUser,
    );
  }
}
