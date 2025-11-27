import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestService } from './request.service';
import { CreateHackathonRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { users } from 'generated/prisma';

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
    @CurrentUser() user: users,
    @Body() createRequestDto: CreateHackathonRequestDto,
  ) {
    return this.requestService.create(user.id, createRequestDto);
  }
}
