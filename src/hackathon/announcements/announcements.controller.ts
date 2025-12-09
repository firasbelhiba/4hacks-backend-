import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { HackathonMin, UserMin } from 'src/common/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { HackathonContextGuard } from '../guards/hackathon.guard';
import { Hackathon } from '../decorators/hackathon.decorator';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';

@ApiTags('Hackathon Announcements')
@Controller('')
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
  @ApiParam({
    name: 'hackathonId',
    description: 'ID of the hackathon',
    required: true,
    type: 'string',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Post('hackathon/:hackathonId/announcements')
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
  @ApiParam({
    name: 'hackathonId',
    description: 'ID of the hackathon',
    required: true,
    type: 'string',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard, HackathonContextGuard)
  @Get('hackathon/:hackathonId/announcements')
  async getHackathonAnnouncements(
    @Hackathon() hackathon: HackathonMin,
    @CurrentUser() requesterUser?: UserMin,
  ) {
    return await this.announcementsService.getHackathonAnnouncements(
      hackathon,
      requesterUser,
    );
  }
}
