import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HackathonRequestService } from './hackathon-request.service';
import { CreateHackathonRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { FindByOrganizationDto } from './dto/find.dto';

@ApiTags('Hackathon Requests')
@Controller('hackathon-requests')
export class HackathonRequestController {
  constructor(private readonly requestService: HackathonRequestService) {}

  @ApiOperation({ summary: 'Get all hackathon requests for an organization' })
  @ApiResponse({
    status: 200,
    description: 'Return all hackathon requests for the organization',
  })
  @ApiNotFoundResponse({
    description: 'Organization not found or you are not authorized to view it',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findByOrganization(
    @Query() query: FindByOrganizationDto,
    @CurrentUser() user: UserMin,
  ) {
    const identifier = query.org;
    return this.requestService.findByOrganization(identifier, user);
  }

  @ApiOperation({ summary: 'Create a hackathon creation request' })
  @ApiBody({ type: CreateHackathonRequestDto })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User is not the owner of the organization',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @CurrentUser() user: UserMin,
    @Body() createRequestDto: CreateHackathonRequestDto,
  ) {
    return this.requestService.create(user.id, createRequestDto);
  }

  @ApiOperation({ summary: 'Get hackathon request details' })
  @ApiParam({
    name: 'identifier',
    description: 'Request identifier (id or hackathon slug)',
    example: 'hedera-africa-hackathon-2025',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the hackathon request details',
  })
  @ApiNotFoundResponse({
    description:
      'Hackathon request not found or you are not authorized to view it',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':identifier')
  findOne(
    @Param('identifier') identifier: string,
    @CurrentUser() user: UserMin,
  ) {
    return this.requestService.findOne(identifier, user);
  }
}
