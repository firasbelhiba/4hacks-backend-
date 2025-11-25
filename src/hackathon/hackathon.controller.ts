import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
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
import { CreateHackathonDto } from './dto/create.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateHackathonDto } from './dto/update.dto';

@ApiTags('Hackathons')
@Controller('hackathon')
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @ApiOperation({
    summary: 'Create a new hackathon',
    description: 'Create a new hackathon.',
  })
  @ApiBody({
    type: CreateHackathonDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Hackathon created successfully.',
    schema: {
      example: {
        message: 'Hackathon created successfully',
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
        message:
          'You are not authorized to create a hackathon with this organization',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Conflict',
    schema: {
      example: {
        message: 'Hackathon with this slug already exists',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
    schema: {
      example: {
        message: 'Organization not found',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() createHackathonDto: CreateHackathonDto,
  ) {
    return await this.hackathonService.create(userId, createHackathonDto);
  }

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
}
