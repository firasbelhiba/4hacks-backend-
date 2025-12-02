import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { HackathonMin, UserMin } from 'src/common/types';
import { CreateSubmissionDto } from './dto/create.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { HackathonContextGuard } from '../guards/hackathon.guard';
import { Hackathon } from '../decorators/hackathon.decorator';

@ApiTags('Hackathon Submissions')
@Controller('hackathon/:hackathonId/submissions')
@UseGuards(HackathonContextGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({
    summary: 'Create a new submission for a hackathon',
    description:
      'Creates a new submission associated with the specified hackathon. The submission is linked to the current user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Submission created successfully',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon, team, track, or bounty not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid submission data',
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'ID of the hackathon',
    example: 'hackathon_12345',
  })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Hackathon() hackathon: HackathonMin,
    @Body() createSubmissionDto: CreateSubmissionDto,
    @CurrentUser() user: UserMin,
  ) {
 
    return this.submissionsService.createSubmission(
      hackathon,
      createSubmissionDto,
      user,
    );
  }
}
