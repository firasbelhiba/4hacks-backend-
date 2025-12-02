import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
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
import { ManageSponsorsDto } from './dto/sponsor.dto';
import {
  QueryHackathonsDto,
  PaginatedHackathonsDto,
} from './dto/query-hackathons.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';
import type { UserMin } from 'src/common/types';

@ApiTags('Hackathons')
@Controller('hackathon')
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @ApiOperation({
    summary: 'List/Search Hackathons',
    description:
      'Get a paginated list of hackathons with support for filtering, searching, and sorting. **Admins** see all hackathons. **Authenticated users** see all ACTIVE hackathons plus their own non-public hackathons (DRAFT, ARCHIVED, CANCELLED). **Unauthenticated users** see only ACTIVE hackathons. Authentication is optional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of hackathons',
    type: PaginatedHackathonsDto,
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(
    @Query() query: QueryHackathonsDto,
    @CurrentUser() user?: UserMin,
  ): Promise<PaginatedHackathonsDto> {
    return await this.hackathonService.findAll(query, user);
  }

  @ApiOperation({
    summary: 'Update a hackathon',
    description: 'Update a hackathon.',
  })
  @ApiParam({
    name: 'identifier',
    description: 'ID or slug of the hackathon',
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
  @Patch(':identifier')
  async update(
    @Param('identifier') identifier: string,
    @CurrentUser('id') userId: string,
    @Body() updateHackathonDto: UpdateHackathonDto,
  ) {
    return await this.hackathonService.update(
      identifier,
      userId,
      updateHackathonDto,
    );
  }

  @ApiOperation({
    summary: 'Manage tracks',
    description:
      'Manage all tracks for a hackathon (create, update, delete). Send the full list of desired tracks. Hackathon can be identified by ID or slug.',
  })
  @ApiParam({
    name: 'identifier',
    description: 'ID or slug of the hackathon',
    required: true,
    type: String,
    example: 'web3-innovation-hackathon',
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
          winnersCount: 3,
        },
        {
          id: 'cuid',
          name: 'Track 2',
          description: 'Description 2',
          judgingCriteria: 'Criteria 2',
          order: 2,
          winnersCount: 1,
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
  @Put(':identifier/tracks')
  async manageTracks(
    @Param('identifier') hackathonIdentifier: string,
    @CurrentUser('id') userId: string,
    @Body() manageTracksDto: ManageTracksDto,
  ) {
    return await this.hackathonService.manageTracks(
      hackathonIdentifier,
      userId,
      manageTracksDto,
    );
  }

  @ApiOperation({
    summary: 'Get all tracks',
    description:
      'Get all tracks for a specific hackathon. Hackathon can be identified by ID or slug. Accessible by admin, organization owner, or anyone if hackathon is not in draft/cancelled status.',
  })
  @ApiParam({
    name: 'identifier',
    description: 'ID or slug of the hackathon',
    required: true,
    type: String,
    example: 'web3-innovation-hackathon',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracks retrieved successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found or access denied',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':identifier/tracks')
  async getTracks(
    @Param('identifier') hackathonIdentifier: string,
    @CurrentUser() user?: UserMin | undefined,
  ) {
    return await this.hackathonService.getTracks(hackathonIdentifier, user);
  }

  @ApiOperation({
    summary: 'Manage sponsors',
    description:
      'Manage all sponsors for a hackathon (create, update, delete). The first sponsor is always the organization creating the hackathon and only its logo can be updated. Hackathon can be identified by ID or slug.',
  })
  @ApiParam({
    name: 'identifier',
    description: 'ID or slug of the hackathon',
    required: true,
    type: String,
    example: 'web3-innovation-hackathon',
  })
  @ApiBody({
    type: ManageSponsorsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Sponsors updated successfully.',
    example: {
      message: 'Sponsors updated successfully',
      data: [
        {
          id: 'cuid',
          name: 'Organization Name',
          logo: 'https://example.com/logo.png',
          isCurrentOrganization: true,
        },
        {
          id: 'cuid',
          name: 'Sponsor Name',
          logo: 'https://example.com/sponsor-logo.png',
          isCurrentOrganization: false,
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
  @Put(':identifier/sponsors')
  async manageSponsors(
    @Param('identifier') hackathonIdentifier: string,
    @CurrentUser('id') userId: string,
    @Body() manageSponsorsDto: ManageSponsorsDto,
  ) {
    return await this.hackathonService.manageSponsors(
      hackathonIdentifier,
      userId,
      manageSponsorsDto,
    );
  }

  @ApiOperation({
    summary: 'Get all sponsors',
    description:
      'Get all sponsors for a specific hackathon. Hackathon can be identified by ID or slug. Accessible by admin, organization owner, or anyone if hackathon is not in draft/cancelled status.',
  })
  @ApiParam({
    name: 'identifier',
    description: 'ID or slug of the hackathon',
    required: true,
    type: String,
    example: 'web3-innovation-hackathon',
  })
  @ApiResponse({
    status: 200,
    description: 'Sponsors retrieved successfully.',
    example: {
      data: [
        {
          id: 'cuid',
          name: 'Organization Name',
          logo: 'https://example.com/logo.png',
          isCurrentOrganization: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'cuid',
          name: 'Sponsor Name',
          logo: 'https://example.com/sponsor-logo.png',
          isCurrentOrganization: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found or access denied',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':identifier/sponsors')
  async getSponsors(
    @Param('identifier') hackathonIdentifier: string,
    @CurrentUser() user?: UserMin | undefined,
  ) {
    return await this.hackathonService.getSponsors(hackathonIdentifier, user);
  }

  @ApiOperation({
    summary: 'Publish a hackathon',
    description:
      'Publish a hackathon by changing its status from DRAFT to the appropriate status based on dates. Only hackathons in DRAFT status can be published. The status will be automatically determined based on current date and hackathon dates (UPCOMING, REGISTRATION, ACTIVE, JUDGING). Organization owner only.',
  })
  @ApiParam({
    name: 'identifier',
    description: 'ID or slug of the hackathon',
    required: true,
    type: String,
    example: 'web3-innovation-hackathon',
  })
  @ApiResponse({
    status: 200,
    description: 'Hackathon published successfully.',
    schema: {
      example: {
        message: 'Hackathon published successfully',
        data: {
          id: 'cuid',
          slug: 'hackathon-slug',
          title: 'Hackathon Title',
          status: 'UPCOMING',
          organizationId: 'cuid',
          registrationStart: '2024-12-01T00:00:00.000Z',
          registrationEnd: '2024-12-15T00:00:00.000Z',
          startDate: '2024-12-16T00:00:00.000Z',
          endDate: '2024-12-30T00:00:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - User is not the organization owner',
    schema: {
      example: {
        message: 'You are not authorized to publish this hackathon',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
    schema: {
      example: {
        message: 'Hackathon not found',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Hackathon is not in DRAFT status',
    schema: {
      example: {
        message:
          'Cannot publish hackathon. Current status is ACTIVE. Only hackathons in DRAFT status can be published',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':identifier/publish')
  async publishHackathon(
    @Param('identifier') identifier: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.hackathonService.publishHackathon(identifier, userId);
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
