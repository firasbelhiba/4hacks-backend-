import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HackathonService } from './hackathon.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateHackathonDto } from './dto/update.dto';
import { ManageTracksDto } from './dto/track.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';
import { UserMin } from 'src/common/types';

@ApiTags('Hackathons')
@Controller('hackathon')
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @ApiOperation({
    summary: 'Update a hackathon',
    description: 'Update a hackathon.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the hackathon to update',
    required: true,
    type: String,
  })
  @ApiBody({
    type: UpdateHackathonDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Hackathon updated successfully.',
    schema: {
      example: {
        message: 'Hackathon updated successfully',
        data: {
          id: 'cuid',
          slug: 'hackathon-slug',
          title: 'Hackathon Title',
          organizationId: 'cuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'You are not authorized to update this hackathon',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
    schema: {
      example: {
        message: 'Hackathon not found',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') hackathonId: string,
    @CurrentUser('id') userId: string,
    @Body() updateHackathonDto: UpdateHackathonDto,
  ) {
    return await this.hackathonService.update(
      hackathonId,
      userId,
      updateHackathonDto,
    );
  }

  @ApiOperation({
    summary: 'Manage tracks',
    description:
      'Manage all tracks for a hackathon (create, update, delete). Send the full list of desired tracks.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the hackathon',
    required: true,
    type: String,
  })
  @ApiBody({
    type: ManageTracksDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Tracks updated successfully.',
    example: {
      message: 'Tracks updated successfully',
      data: [
        {
          id: 'cuid',
          name: 'Track 1',
          description: 'Description 1',
          judgingCriteria: 'Criteria 1',
          order: 1,
        },
        {
          id: 'cuid',
          name: 'Track 2',
          description: 'Description 2',
          judgingCriteria: 'Criteria 2',
          order: 2,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/tracks')
  async manageTracks(
    @Param('id') hackathonId: string,
    @CurrentUser('id') userId: string,
    @Body() manageTracksDto: ManageTracksDto,
  ) {
    return await this.hackathonService.manageTracks(
      hackathonId,
      userId,
      manageTracksDto,
    );
  }

  @ApiOperation({
    summary: 'Get all tracks',
    description: 'Get all tracks for a specific hackathon.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the hackathon',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Tracks retrieved successfully.',
  })
  @Get(':id/tracks')
  async getTracks(@Param('id') hackathonId: string) {
    return await this.hackathonService.getTracks(hackathonId);
  }

  @ApiOperation({
    summary: 'Get hackathon by identifier',
    description:
      'Retrieve a hackathon by its ID or slug. If the hackathon is in draft status, only the organization owner can access it.',
  })
  @ApiParam({
    name: 'identifier',
    description: 'ID or slug of the hackathon',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Hackathon retrieved successfully.',
    schema: {
      example: {
        message: 'Hackathon retrieved successfully',
        data: {
          id: 'cuid',
          slug: 'hackathon-slug',
          title: 'Hackathon Title',
          organization: {
            id: 'cuid',
            name: 'Organization Name',
            ownerId: 'cuid',
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found or access denied',
    schema: {
      example: {
        message: 'Hackathon not found or access denied',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':identifier')
  async getHackathonByIdentifier(
    @Param('identifier') identifier: string,
    @CurrentUser() user?: UserMin | undefined,
  ) {
    return await this.hackathonService.getHackathonByIdentifier(
      identifier,
      user,
    );
  }
}
