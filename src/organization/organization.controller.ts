import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create.dto';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Organizations')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @ApiOperation({
    summary: 'Create a new organization',
    description:
      'Create a new organization. the owner of the organization will be the user who is logged in',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
    schema: {
      example: {
        message: 'Organization created successfully',
        data: {
          id: '1',
          name: 'Organization 1',
          slug: 'organization-1',
          logo: 'https://example.com/logo.png',
          tagline: 'Tagline 1',
          description: 'Description 1',
          location: 'Location 1',
          website: 'https://example.com',
          github: 'https://github.com/organization-1',
          twitter: 'https://twitter.com/organization-1',
          ownerId: '1',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Organization already exists.',
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
  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return await this.organizationService.create(userId, createOrganizationDto);
  }

  @ApiOperation({
    summary: 'Get organization by id, slug or name',
    description: 'Get organization by id, slug or name',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization fetched successfully',
    schema: {
      example: {
        message: 'Organization fetched successfully',
        data: {
          id: '1',
          name: 'Organization 1',
          slug: 'organization-1',
          logo: 'https://example.com/logo.png',
          tagline: 'Tagline 1',
          description: 'Description 1',
          location: 'Location 1',
          website: 'https://example.com',
          github: 'https://github.com/organization-1',
          twitter: 'https://twitter.com/organization-1',
          ownerId: '1',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
          owner: {
            id: '1',
            name: 'User 1',
            email: 'user1@example.com',
            image: 'https://example.com/image.png',
          },
          hackathons: [
            {
              id: '1',
              slug: 'hackathon-1',
              title: 'Hackathon 1',
              organizationId: '1',
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
  @ApiParam({
    name: 'identifier',
    description: 'Organization id, slug or name',
    type: 'string',
  })
  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    return await this.organizationService.findOne(identifier);
  }
}
