import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JudgesService } from './judges.service';
import { InviteJudgeDto } from './dto/invite.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { HackathonMin, UserMin } from 'src/common/types';
import { Hackathon } from '../decorators/hackathon.decorator';
import { HackathonContextGuard } from '../guards/hackathon.guard';

@ApiTags('Judges')
@Controller()
export class JudgesController {
  constructor(private readonly judgesService: JudgesService) {}

  @ApiOperation({
    summary: 'Invite a judge',
    description: 'Invite a judge to a hackathon.',
  })
  @ApiResponse({
    status: 200,
    description: 'Judge invited successfully.',
    schema: {
      example: {
        message: 'Judge invited successfully',
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
        message: 'You are not authorized to invite a judge to this hackathon',
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
  @ApiParam({
    name: 'hackathonId',
    description: 'ID of the hackathon',
    required: true,
    type: String,
    example: 'cuid',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, HackathonContextGuard)
  @Post('hackathon/:hackathonId/judges/invite')
  async inviteJudge(
    @Body() inviteJudgeDto: InviteJudgeDto,
    @CurrentUser() user: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.judgesService.inviteJudge(
      inviteJudgeDto,
      user,
      hackathon,
    );
  }
}
