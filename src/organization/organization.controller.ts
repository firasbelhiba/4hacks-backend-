import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create.dto';
import { UpdateOrganizationDto } from './dto/update.dto';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Organizations')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @ApiOperation({
    summary: 'Create a new organization',
    description:
      'Create a new organization with comprehensive details. The owner of the organization will be the authenticated user. You can optionally upload a logo image (JPEG, PNG, or WebP, max 5MB).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Organization details and optional logo image',
    schema: {
      type: 'object',
      required: [
        'name',
        'slug',
        'displayName',
        'type',
        'establishedYear',
        'size',
        'operatingRegions',
        'email',
        'phone',
        'country',
        'city',
        'website',
        'linkedin',
        'github',
        'twitter',
      ],
      properties: {
        // File upload
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Organization logo image (JPEG, PNG, or WebP, max 5MB)',
        },
        // Basic Information
        name: {
          type: 'string',
          description: 'Unique name of the organization',
          example: 'Dar Blockchain',
        },
        slug: {
          type: 'string',
          description: 'URL-friendly slug (unique, lowercase)',
          example: 'dar-blockchain',
        },
        displayName: {
          type: 'string',
          description: 'Display name for the organization',
          example: 'Dar Blockchain',
        },
        tagline: {
          type: 'string',
          description: 'Short tagline',
          example: 'Building the future of blockchain in Tunisia',
        },
        description: {
          type: 'string',
          description: 'Detailed description',
          example: 'We are a blockchain organization focused on education',
        },
        // Type and Size
        type: {
          type: 'string',
          enum: [
            'ENTERPRISE',
            'STARTUP',
            'DAO',
            'NON_PROFIT',
            'EDUCATIONAL_INSTITUTION',
            'GOVERNMENT_AGENCY',
            'COMMUNITY_DEVELOPER_GROUP',
            'BLOCKCHAIN_FOUNDATION',
            'STUDENT_ORGANIZATION',
          ],
          description: 'Type of organization',
          example: 'STARTUP',
        },
        establishedYear: {
          type: 'integer',
          description: 'Year the organization was established',
          example: 2020,
          minimum: 1800,
        },
        size: {
          type: 'string',
          enum: [
            'ONE_TO_TEN',
            'ELEVEN_TO_FIFTY',
            'FIFTY_ONE_TO_TWO_HUNDRED',
            'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
            'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND',
            'ONE_THOUSAND',
            'COMMUNITY_DRIVEN',
          ],
          description: 'Size of the organization',
          example: 'ELEVEN_TO_FIFTY',
        },
        operatingRegions: {
          type: 'string',
          description:
            'Comma-separated list of operating regions or array of regions',
          example: 'AFRICA,EUROPE',
          enum: [
            'NORTH_AMERICA',
            'SOUTH_AMERICA',
            'EUROPE',
            'AFRICA',
            'ASIA',
            'MIDDLE_EAST',
            'OCEANIA',
            'GLOBAL',
          ],
        },
        // Contact Information
        email: {
          type: 'string',
          format: 'email',
          description: 'Primary email address',
          example: 'contact@darblockchain.io',
        },
        phone: {
          type: 'string',
          description: 'Primary phone number',
          example: '+216 12 345 678',
        },
        // Location
        country: {
          type: 'string',
          description: 'Country',
          example: 'Tunisia',
        },
        city: {
          type: 'string',
          description: 'City',
          example: 'Tunis',
        },
        state: {
          type: 'string',
          description: 'State/Province (optional)',
          example: 'Tunis',
        },
        zipCode: {
          type: 'string',
          description: 'ZIP/Postal code (optional)',
          example: '1000',
        },
        loc_address: {
          type: 'string',
          description: 'Physical address (optional)',
          example: '123 Blockchain Street',
        },
        // Primary Social Links
        website: {
          type: 'string',
          format: 'uri',
          description: 'Official website URL',
          example: 'https://darblockchain.io',
        },
        linkedin: {
          type: 'string',
          format: 'uri',
          description: 'LinkedIn profile URL',
          example: 'https://www.linkedin.com/in/dar-blockchain/',
        },
        github: {
          type: 'string',
          format: 'uri',
          description: 'GitHub organization URL',
          example: 'https://github.com/Dar-Blockchain',
        },
        twitter: {
          type: 'string',
          format: 'uri',
          description: 'Twitter/X profile URL',
          example: 'https://twitter.com/darblockchain',
        },
        // Optional Social Links
        discord: {
          type: 'string',
          format: 'uri',
          description: 'Discord server URL (optional)',
          example: 'https://discord.gg/darblockchain',
        },
        telegram: {
          type: 'string',
          format: 'uri',
          description: 'Telegram group/channel URL (optional)',
          example: 'https://t.me/darblockchain',
        },
        medium: {
          type: 'string',
          format: 'uri',
          description: 'Medium publication URL (optional)',
          example: 'https://medium.com/@darblockchain',
        },
        youtube: {
          type: 'string',
          format: 'uri',
          description: 'YouTube channel URL (optional)',
          example: 'https://youtube.com/@darblockchain',
        },
        facebook: {
          type: 'string',
          format: 'uri',
          description: 'Facebook page URL (optional)',
          example: 'https://facebook.com/darblockchain',
        },
        instagram: {
          type: 'string',
          format: 'uri',
          description: 'Instagram profile URL (optional)',
          example: 'https://instagram.com/darblockchain',
        },
        reddit: {
          type: 'string',
          format: 'uri',
          description: 'Reddit community URL (optional)',
          example: 'https://reddit.com/r/darblockchain',
        },
        warpcast: {
          type: 'string',
          format: 'uri',
          description: 'Warpcast profile URL (optional)',
          example: 'https://warpcast.com/darblockchain',
        },
        otherSocials: {
          type: 'string',
          description: 'Comma-separated list of other social media URLs',
          example: 'https://example.com/social1,https://example.com/social2',
        },
        // Other Fields
        sector: {
          type: 'string',
          description: 'Industry sector (optional)',
          example: 'Blockchain Technology',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
    schema: {
      example: {
        message: 'Organization created successfully',
        data: {
          id: 'cm4abc123xyz',
          name: 'Dar Blockchain',
          slug: 'dar-blockchain',
          displayName: 'Dar Blockchain',
          logo: 'https://r2.example.com/4hacks/profiles/user123/1234567890-logo.png',
          tagline: 'Building the future of blockchain in Tunisia',
          description: 'We are a blockchain organization focused on education',
          type: 'STARTUP',
          establishedYear: 2020,
          size: 'ELEVEN_TO_FIFTY',
          operatingRegions: ['AFRICA', 'EUROPE'],
          email: 'contact@darblockchain.io',
          phone: '+216 12 345 678',
          country: 'Tunisia',
          city: 'Tunis',
          state: 'Tunis',
          zipCode: '1000',
          loc_address: '123 Blockchain Street',
          website: 'https://darblockchain.io',
          linkedin: 'https://linkedin.com/company/darblockchain',
          github: 'https://github.com/darblockchain',
          twitter: 'https://twitter.com/darblockchain',
          discord: 'https://discord.gg/darblockchain',
          telegram: 'https://t.me/darblockchain',
          medium: null,
          youtube: null,
          facebook: null,
          instagram: null,
          reddit: null,
          warpcast: null,
          otherSocials: [],
          sector: 'Blockchain Technology',
          ownerId: 'user123',
          createdAt: '2024-11-26T19:37:00.000Z',
          updatedAt: '2024-11-26T19:37:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or file upload error',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Organization name or slug already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Organization with this slug already exists.',
        error: 'Conflict',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('logo'))
  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() createOrganizationDto: CreateOrganizationDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.organizationService.create(
      userId,
      createOrganizationDto,
      logo,
    );
  }

  @ApiOperation({
    summary: 'Get organization by id, slug or name',
    description:
      'Get organization by id, slug or name. This endpoint is public but if you are logged in with a specific user and provide the JWT access token, you will get more details (e.g., draft hackathons if you are the owner).',
  })
  @ApiParam({
    name: 'identifier',
    description: 'Organization id, slug or name',
    type: 'string',
    example: 'dar-blockchain',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization fetched successfully',
    schema: {
      example: {
        message: 'Organization fetched successfully',
        data: {
          id: 'cm4abc123xyz',
          name: 'Dar Blockchain',
          slug: 'dar-blockchain',
          displayName: 'Dar Blockchain',
          logo: 'https://r2.example.com/4hacks/profiles/user123/1234567890-logo.png',
          tagline: 'Building the future of blockchain in Tunisia',
          description: 'We are a blockchain organization focused on education',
          type: 'STARTUP',
          establishedYear: 2020,
          size: 'ELEVEN_TO_FIFTY',
          operatingRegions: ['AFRICA', 'EUROPE'],
          email: 'contact@darblockchain.io',
          phone: '+216 12 345 678',
          country: 'Tunisia',
          city: 'Tunis',
          state: 'Tunis',
          zipCode: '1000',
          loc_address: '123 Blockchain Street',
          website: 'https://darblockchain.io',
          linkedin: 'https://linkedin.com/company/darblockchain',
          github: 'https://github.com/darblockchain',
          twitter: 'https://twitter.com/darblockchain',
          discord: 'https://discord.gg/darblockchain',
          telegram: 'https://t.me/darblockchain',
          medium: null,
          youtube: null,
          facebook: null,
          instagram: null,
          reddit: null,
          warpcast: null,
          otherSocials: [],
          sector: 'Blockchain Technology',
          ownerId: 'user123',
          createdAt: '2024-11-26T19:37:00.000Z',
          updatedAt: '2024-11-26T19:37:00.000Z',
          owner: {
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            image: 'https://example.com/image.png',
          },
          hackathons: [
            {
              id: 'hackathon123',
              slug: 'web3-hackathon-2024',
              title: 'Web3 Hackathon 2024',
              organizationId: 'cm4abc123xyz',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Organization not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':identifier')
  async findOne(
    @Param('identifier') identifier: string,
    @CurrentUser('id') userId?: string,
  ) {
    return await this.organizationService.findOne(identifier, userId);
  }

  @ApiOperation({
    summary: 'Update an organization',
    description:
      'Update an existing organization. Only the owner can update the organization. All fields are optional - you can update only the fields you want to change. You can also upload a new logo image (JPEG, PNG, or WebP, max 5MB).',
  })
  @ApiParam({
    name: 'identifier',
    description: 'Organization id, slug or name',
    type: 'string',
    example: 'dar-blockchain',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Organization fields to update and optional new logo image',
    schema: {
      type: 'object',
      required: [],

      properties: {
        // File upload
        logo: {
          type: 'string',
          format: 'binary',
          description:
            'New organization logo image (JPEG, PNG, or WebP, max 5MB)',
        },
        // Basic Information
        name: {
          type: 'string',
          description: 'Unique name of the organization',
          example: 'Dar Blockchain',
        },
        slug: {
          type: 'string',
          description: 'URL-friendly slug (unique, lowercase)',
          example: 'dar-blockchain',
        },
        displayName: {
          type: 'string',
          description: 'Display name for the organization',
          example: 'Dar Blockchain',
        },
        tagline: {
          type: 'string',
          description: 'Short tagline',
          example: 'Building the future of blockchain in Tunisia',
        },
        description: {
          type: 'string',
          description: 'Detailed description',
          example: 'We are a blockchain organization focused on education',
        },
        // Type and Size
        type: {
          type: 'string',
          enum: [
            'ENTERPRISE',
            'STARTUP',
            'DAO',
            'NON_PROFIT',
            'EDUCATIONAL_INSTITUTION',
            'GOVERNMENT_AGENCY',
            'COMMUNITY_DEVELOPER_GROUP',
            'BLOCKCHAIN_FOUNDATION',
            'STUDENT_ORGANIZATION',
          ],
          description: 'Type of organization',
          example: 'STARTUP',
        },
        establishedYear: {
          type: 'integer',
          description: 'Year the organization was established',
          example: 2020,
          minimum: 1800,
        },
        size: {
          type: 'string',
          enum: [
            'ONE_TO_TEN',
            'ELEVEN_TO_FIFTY',
            'FIFTY_ONE_TO_TWO_HUNDRED',
            'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
            'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND',
            'ONE_THOUSAND',
            'COMMUNITY_DRIVEN',
          ],
          description: 'Size of the organization',
          example: 'ELEVEN_TO_FIFTY',
        },
        operatingRegions: {
          type: 'string',
          description:
            'Comma-separated list of operating regions or array of regions',
          example: 'AFRICA,EUROPE',
        },
        // Contact Information
        email: {
          type: 'string',
          format: 'email',
          description: 'Primary email address',
          example: 'contact@darblockchain.io',
        },
        phone: {
          type: 'string',
          description: 'Primary phone number',
          example: '+216 12 345 678',
        },
        // Location
        country: {
          type: 'string',
          description: 'Country',
          example: 'Tunisia',
        },
        city: {
          type: 'string',
          description: 'City',
          example: 'Tunis',
        },
        state: {
          type: 'string',
          description: 'State/Province',
          example: 'Tunis',
        },
        zipCode: {
          type: 'string',
          description: 'ZIP/Postal code',
          example: '1000',
        },
        loc_address: {
          type: 'string',
          description: 'Physical address',
          example: '123 Blockchain Street',
        },
        // Primary Social Links
        website: {
          type: 'string',
          format: 'uri',
          description: 'Official website URL',
          example: 'https://darblockchain.io',
        },
        linkedin: {
          type: 'string',
          format: 'uri',
          description: 'LinkedIn profile URL',
          example: 'https://linkedin.com/company/darblockchain',
        },
        github: {
          type: 'string',
          format: 'uri',
          description: 'GitHub organization URL',
          example: 'https://github.com/darblockchain',
        },
        twitter: {
          type: 'string',
          format: 'uri',
          description: 'Twitter/X profile URL',
          example: 'https://twitter.com/darblockchain',
        },
        // Optional Social Links
        discord: {
          type: 'string',
          format: 'uri',
          description: 'Discord server URL',
          example: 'https://discord.gg/darblockchain',
        },
        telegram: {
          type: 'string',
          format: 'uri',
          description: 'Telegram group/channel URL',
          example: 'https://t.me/darblockchain',
        },
        medium: {
          type: 'string',
          format: 'uri',
          description: 'Medium publication URL',
          example: 'https://medium.com/@darblockchain',
        },
        youtube: {
          type: 'string',
          format: 'uri',
          description: 'YouTube channel URL',
          example: 'https://youtube.com/@darblockchain',
        },
        facebook: {
          type: 'string',
          format: 'uri',
          description: 'Facebook page URL',
          example: 'https://facebook.com/darblockchain',
        },
        instagram: {
          type: 'string',
          format: 'uri',
          description: 'Instagram profile URL',
          example: 'https://instagram.com/darblockchain',
        },
        reddit: {
          type: 'string',
          format: 'uri',
          description: 'Reddit community URL',
          example: 'https://reddit.com/r/darblockchain',
        },
        warpcast: {
          type: 'string',
          format: 'uri',
          description: 'Warpcast profile URL',
          example: 'https://warpcast.com/darblockchain',
        },
        otherSocials: {
          type: 'string',
          description: 'Comma-separated list of other social media URLs',
          example: 'https://example.com/social1,https://example.com/social2',
        },
        // Other Fields
        sector: {
          type: 'string',
          description: 'Industry sector',
          example: 'Blockchain Technology',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
    schema: {
      example: {
        message: 'Organization updated successfully',
        data: {
          id: 'cm4abc123xyz',
          name: 'Dar Blockchain',
          slug: 'dar-blockchain',
          displayName: 'Dar Blockchain',
          logo: 'https://r2.example.com/4hacks/organizations/logos/dar-blockchain/1234567890-logo.png',
          tagline: 'Building the future of blockchain in Tunisia',
          description: 'We are a blockchain organization focused on education',
          type: 'STARTUP',
          establishedYear: 2020,
          size: 'ELEVEN_TO_FIFTY',
          operatingRegions: ['AFRICA', 'EUROPE'],
          email: 'contact@darblockchain.io',
          phone: '+216 12 345 678',
          country: 'Tunisia',
          city: 'Tunis',
          state: 'Tunis',
          zipCode: '1000',
          loc_address: '123 Blockchain Street',
          website: 'https://darblockchain.io',
          linkedin: 'https://linkedin.com/company/darblockchain',
          github: 'https://github.com/darblockchain',
          twitter: 'https://twitter.com/darblockchain',
          discord: 'https://discord.gg/darblockchain',
          telegram: 'https://t.me/darblockchain',
          medium: null,
          youtube: null,
          facebook: null,
          instagram: null,
          reddit: null,
          warpcast: null,
          otherSocials: [],
          sector: 'Blockchain Technology',
          ownerId: 'user123',
          createdAt: '2024-11-26T19:37:00.000Z',
          updatedAt: '2024-11-26T20:50:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or file upload error',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the owner can update the organization',
    schema: {
      example: {
        statusCode: 403,
        message: 'You are not authorized to update this organization',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Organization not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Organization not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Organization name or slug already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Organization with this slug already exists.',
        error: 'Conflict',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('logo'))
  @Patch(':identifier')
  async update(
    @CurrentUser('id') userId: string,
    @Param('identifier') identifier: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.organizationService.update(
      userId,
      identifier,
      updateOrganizationDto,
      logo,
    );
  }
}
