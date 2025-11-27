import { Body, Controller, Post, UseGuards, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestService } from './request.service';
import { CreateHackathonRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';

@ApiTags('Hackathon Requests')
@Controller('hackathon/request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

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
