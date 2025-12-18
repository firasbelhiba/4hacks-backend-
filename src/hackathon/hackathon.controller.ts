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
  ApiBadRequestResponse,
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
import { ManageBountiesDto } from './dto/bounty.dto';
import {
  QueryHackathonsDto,
  PaginatedHackathonsDto,
} from './dto/query-hackathons.dto';
import {
  QueryTeamPositionsDto,
  PaginatedTeamPositionsDto,
} from './dto/query-team-positions.dto';
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
    @CurrentUser() user?: UserMin,
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
    @CurrentUser() user?: UserMin,
  ) {
    return await this.hackathonService.getSponsors(hackathonIdentifier, user);
  }

  @ApiOperation({
    summary: 'Manage bounties',
    description:
      'Manage all bounties for a hackathon (create, update, delete). Send the full list of desired bounties. Each bounty must have a valid sponsorId that exists for the hackathon. Bounties not in this list will be deleted. Hackathon can be identified by ID or slug. Organization owner only.\n\n' +
      '**Important Notes:**\n' +
      '- Each bounty **must** have a `sponsorId` that exists for this hackathon\n' +
      '- If a bounty is deleted, any submission-bounty associations will be removed (submissions can apply to multiple bounties)\n' +
      '- `maxWinners` can be set to `0` to represent unlimited winners\n' +
      '- Bounties with an `id` will be updated, bounties without an `id` will be created',
  })
  @ApiParam({
    name: 'identifier',
    description: 'ID or slug of the hackathon',
    required: true,
    type: String,
    example: 'web3-innovation-hackathon',
  })
  @ApiBody({
    type: ManageBountiesDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Bounties updated successfully.',
    example: {
      message: 'Bounties updated successfully',
      data: [
        {
          id: 'cuid-1',
          hackathonId: 'hackathon-id',
          sponsorId: 'sponsor-id-1',
          title: 'Best DeFi Innovation',
          description: 'Build an innovative DeFi solution',
          rewardAmount: 1000,
          rewardToken: 'USD',
          maxWinners: 3,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          sponsor: {
            id: 'sponsor-id-1',
            name: 'Acme Corporation',
            logo: 'https://example.com/logo.png',
            isCurrentOrganization: false,
          },
        },
        {
          id: 'cuid-2',
          hackathonId: 'hackathon-id',
          sponsorId: 'sponsor-id-2',
          title: 'Best NFT Project',
          description: 'Create an innovative NFT project',
          rewardAmount: 500,
          rewardToken: 'USD',
          maxWinners: 0, // 0 means unlimited winners
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          sponsor: {
            id: 'sponsor-id-2',
            name: 'NFT Company',
            logo: 'https://example.com/nft-logo.png',
            isCurrentOrganization: false,
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - User is not the organization owner',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid sponsorId - sponsor does not exist for this hackathon',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':identifier/bounties')
  async manageBounties(
    @Param('identifier') hackathonIdentifier: string,
    @CurrentUser('id') userId: string,
    @Body() manageBountiesDto: ManageBountiesDto,
  ) {
    return await this.hackathonService.manageBounties(
      hackathonIdentifier,
      userId,
      manageBountiesDto,
    );
  }

  @ApiOperation({
    summary: 'Get all bounties',
    description:
      'Get all bounties for a specific hackathon. Hackathon can be identified by ID or slug. Each bounty includes its associated sponsor information.\n\n' +
      '**Authorization:**\n' +
      '- Admin: Always allowed\n' +
      '- Organization owner: Always allowed\n' +
      '- Public: Allowed if hackathon status is ACTIVE\n' +
      '- Otherwise: Access denied\n\n' +
      '**Response includes:**\n' +
      '- Full bounty details (title, description, rewardAmount, rewardToken, maxWinners)\n' +
      '- Sponsor information (id, name, logo, isCurrentOrganization)\n' +
      '- Note: `maxWinners` of `0` means unlimited winners',
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
    description: 'Bounties retrieved successfully.',
    example: {
      data: [
        {
          id: 'cuid-1',
          hackathonId: 'hackathon-id',
          sponsorId: 'sponsor-id-1',
          title: 'Best DeFi Innovation',
          description: 'Build an innovative DeFi solution',
          rewardAmount: 1000,
          rewardToken: 'USD',
          maxWinners: 3,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          sponsor: {
            id: 'sponsor-id-1',
            name: 'Acme Corporation',
            logo: 'https://example.com/logo.png',
            isCurrentOrganization: false,
          },
        },
        {
          id: 'cuid-2',
          hackathonId: 'hackathon-id',
          sponsorId: 'sponsor-id-2',
          title: 'Best NFT Project',
          description: 'Create an innovative NFT project',
          rewardAmount: 500,
          rewardToken: 'USD',
          maxWinners: 0, // 0 means unlimited winners
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          sponsor: {
            id: 'sponsor-id-2',
            name: 'NFT Company',
            logo: 'https://example.com/nft-logo.png',
            isCurrentOrganization: false,
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found or access denied',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':identifier/bounties')
  async getBounties(
    @Param('identifier') hackathonIdentifier: string,
    @CurrentUser() user?: UserMin,
  ) {
    return await this.hackathonService.getBounties(hackathonIdentifier, user);
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
    summary: 'Archive a hackathon (Owner only)',
    description: `
Archive a hackathon by changing its status to ARCHIVED.
Only the organization owner can archive their hackathons.

**Allowed statuses:**
- **DRAFT** hackathons can be archived anytime
- **ACTIVE** hackathons can be archived if:
  - Not started yet (before registration opens), OR
  - Everything is done (after end date and judging period if provided)

**Restrictions:**
- Cannot archive while hackathon is in progress (registration → end date)
- Cannot archive while judging is in progress (if judging dates are set)
- Cannot archive CANCELLED hackathons
- Cannot archive already ARCHIVED hackathons
    `,
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
    description: 'Hackathon archived successfully.',
    schema: {
      example: {
        message: 'Hackathon archived successfully',
        data: {
          id: 'cuid',
          title: 'Hackathon Title',
          slug: 'hackathon-slug',
          status: 'ARCHIVED',
          organizationId: 'cuid',
          startDate: '2024-12-16T00:00:00.000Z',
          endDate: '2024-12-30T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - User is not the organization owner',
    schema: {
      example: {
        message: 'You are not authorized to archive this hackathon',
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
  @ApiBadRequestResponse({
    description: 'Cannot archive hackathon due to its current status or timing',
    schema: {
      example: {
        message:
          'Cannot archive hackathon before it has ended. The hackathon end date has not passed yet.',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':identifier/archive')
  async archiveHackathon(
    @Param('identifier') identifier: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.hackathonService.archiveHackathon(identifier, userId);
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
    @CurrentUser() user?: UserMin,
  ) {
    return await this.hackathonService.getHackathonByIdentifier(
      identifier,
      user,
    );
  }

  @ApiOperation({
    summary: 'Get all winners for a hackathon',
    description:
      'Retrieve all prize winners for a specific hackathon with comprehensive details including submission, team members, and prize information. ' +
      'Winners are grouped by prize type (TRACK/BOUNTY) and ordered by prize position. ' +
      '\n\n**Access Control:**\n' +
      '- **Admin**: Can access all hackathons\n' +
      '- **Organization Owner**: Can access their own hackathons\n' +
      '- **Active Hackathons**: Anyone can access\n' +
      '- **Private Hackathons**: Only registered users can access\n' +
      '- **Non-Active Hackathons**: Only admin or owner can access',
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
    description: 'Winners retrieved successfully',
    schema: {
      example: {
        hackathon: {
          id: 'clx1234567890',
          title: 'Web3 Innovation Hackathon',
          slug: 'web3-innovation-hackathon',
          organization: {
            id: 'clx0987654321',
            name: 'Tech Organization',
            ownerId: 'clx1111222233',
          },
        },
        winners: [
          {
            id: 'clx5555666677',
            prizeId: 'clx7777888899',
            submissionId: 'clx9999000011',
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T00:00:00.000Z',
            prize: {
              id: 'clx7777888899',
              position: 1,
              name: 'First Place - DeFi Track',
              hackathonId: 'clx1234567890',
              trackId: 'clx2222333344',
              bountyId: null,
              type: 'TRACK',
              amount: 5000,
              token: 'USD',
              track: {
                id: 'clx2222333344',
                name: 'DeFi Track',
                description: 'Build innovative DeFi solutions',
              },
              bounty: null,
            },
            submission: {
              id: 'clx9999000011',
              title: 'Amazing DeFi Project',
              tagline: 'Revolutionary DeFi platform',
              description: 'A comprehensive DeFi solution...',
              logo: 'https://example.com/logo.png',
              demoUrl: 'https://demo.example.com',
              videoUrl: 'https://youtube.com/watch?v=...',
              repoUrl: 'https://github.com/team/project',
              status: 'SUBMITTED',
              isWinner: true,
              team: {
                id: 'clx3333444455',
                name: 'Team Awesome',
                tagline: 'Building the future',
                image: 'https://example.com/team.png',
                members: [
                  {
                    id: 'clx4444555566',
                    userId: 'clx6666777788',
                    isLeader: true,
                    user: {
                      id: 'clx6666777788',
                      name: 'John Doe',
                      username: 'johndoe',
                      image: 'https://example.com/john.png',
                    },
                  },
                  {
                    id: 'clx4444555567',
                    userId: 'clx6666777789',
                    isLeader: false,
                    user: {
                      id: 'clx6666777789',
                      name: 'Jane Smith',
                      username: 'janesmith',
                      image: 'https://example.com/jane.png',
                    },
                  },
                ],
              },
              track: {
                id: 'clx2222333344',
                name: 'DeFi Track',
              },
              bounty: null,
            },
          },
        ],
        totalWinners: 1,
      },
    },
  })
  @ApiNotFoundResponse({
    description:
      'Hackathon not found, access denied, or not registered for private hackathon',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':identifier/winners')
  async getHackathonWinners(
    @Param('identifier') identifier: string,
    @CurrentUser() user?: UserMin,
  ) {
    return await this.hackathonService.getHackathonWinners(identifier, user);
  }

  @ApiOperation({
    summary: 'Get all team positions for a hackathon',
    description:
      'Retrieve all team positions for teams participating in a specific hackathon with pagination, filtering, and sorting. ' +
      'Hackathon can be identified by ID or slug. ' +
      '\\n\\n**Access Control:**\\n' +
      '- **Admin**: Can access all hackathons\\n' +
      '- **Organization Owner**: Can access their own hackathons\\n' +
      '- **Public Hackathons**: Anyone can access\\n' +
      '- **Private Hackathons**: Only registered users can access (plus admin and owner)' +
      '\\n\\n**Filtering:**\\n' +
      '- Filter by team ID\\n' +
      '- Filter by position status (OPEN/CLOSED)\\n' +
      '- Search in title, description, or required skills' +
      '\\n\\n**Sorting:**\\n' +
      '- Sort by createdAt, title, or status\\n' +
      '- Sort order: asc or desc',
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
    description: 'Team positions retrieved successfully',
    type: PaginatedTeamPositionsDto,
    schema: {
      example: {
        data: [
          {
            id: 'cmj70dgvx000054fdhc2w7t7x',
            teamId: 'cmj45ptq703fcwofd82wy9k09',
            createdById: 'cmj45pq1i00bcwofdnljyob3o',
            title: 'Backend Developer',
            description: 'Looking for an experienced backend developer',
            requiredSkills: ['Node.js', 'TypeScript', 'PostgreSQL'],
            status: 'OPEN',
            createdAt: '2025-12-15T10:26:06.141Z',
            updatedAt: '2025-12-15T10:26:06.141Z',
            team: {
              id: 'cmj45ptq703fcwofd82wy9k09',
              name: 'Team Awesome',
              tagline: 'Building the future',
              image: 'https://example.com/team.png',
              hackathonId: 'cmj1234567890',
            },
            createdBy: {
              id: 'cmj45pq1i00bcwofdnljyob3o',
              name: 'John Doe',
              username: 'johndoe',
              image: 'https://example.com/john.png',
            },
          },
          {
            id: 'cmj70dgvx000054fdhc2w7t8y',
            teamId: 'cmj45ptq703fcwofd82wy9k10',
            createdById: 'cmj45pq1i00bcwofdnljyob4p',
            title: 'Frontend Developer',
            description: 'Seeking a skilled frontend developer',
            requiredSkills: ['React', 'TypeScript', 'TailwindCSS'],
            status: 'OPEN',
            createdAt: '2025-12-15T11:00:00.000Z',
            updatedAt: '2025-12-15T11:00:00.000Z',
            team: {
              id: 'cmj45ptq703fcwofd82wy9k10',
              name: 'Tech Innovators',
              tagline: 'Innovation at its best',
              image: 'https://example.com/team2.png',
              hackathonId: 'cmj1234567890',
            },
            createdBy: {
              id: 'cmj45pq1i00bcwofdnljyob4p',
              name: 'Jane Smith',
              username: 'janesmith',
              image: 'https://example.com/jane.png',
            },
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found or not registered for private hackathon',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':identifier/team-positions')
  async getTeamPositions(
    @Param('identifier') identifier: string,
    @Query() query: QueryTeamPositionsDto,
    @CurrentUser() user?: UserMin,
  ) {
    return await this.hackathonService.getTeamPositions(
      identifier,
      query,
      user,
    );
  }
}
