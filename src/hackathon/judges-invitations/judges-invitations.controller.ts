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
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { InviteJudgeDto } from './dto/invite.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { HackathonMin, UserMin } from 'src/common/types';
import { Hackathon } from '../decorators/hackathon.decorator';
import { HackathonContextGuard } from '../guards/hackathon.guard';
import { JudgesInvitationsService } from './judges-invitations.service';

@ApiTags('Hackathon Judges Invitations')
@Controller()
export class JudgesInvitationsController {
  constructor(
    private readonly judgesInvitationsService: JudgesInvitationsService,
  ) {}

  @ApiOperation({
    summary: 'Invite a judge',
    description: 'Invite a judge to a hackathon.',
  })
  @ApiResponse({
    status: 201,
    description: 'Judge invited successfully.',
    schema: {
      example: {
        message: 'Judge invited successfully',
        data: {
          id: 'cmj17tgpl0001isfd8pvywf7z',
          hackathonId: 'cmj17s4ns000jo0fdr8szah2z',
          invitedUserId: 'cmj17s4ms0007o0fduw4mmbd5',
          invitedById: 'cmj17s4ms0007o0fduw4mmbd5',
          status: 'PENDING',
          respondedAt: null,
          createdAt: '2025-12-11T09:07:52.665Z',
          updatedAt: '2025-12-11T09:07:52.665Z',
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
  @Post('hackathon/:hackathonId/judges-invitations')
  async inviteJudge(
    @Body() inviteJudgeDto: InviteJudgeDto,
    @CurrentUser() user: UserMin,
    @Hackathon() hackathon: HackathonMin,
  ) {
    return await this.judgesInvitationsService.inviteJudge(
      inviteJudgeDto,
      user,
      hackathon,
    );
  }

  @ApiOperation({
    summary: 'Accept a judge invitation',
    description: 'Accept a judge invitation to a hackathon.',
  })
  @ApiResponse({
    status: 200,
    description: 'Judge invitation accepted successfully.',
    schema: {
      example: {
        message: 'Judge invitation accepted successfully',
        data: {
          id: 'cmj17tgpl0001isfd8pvywf7z',
          hackathonId: 'cmj17s4ns000jo0fdr8szah2z',
          invitedUserId: 'cmj17s4ms0007o0fduw4mmbd5',
          invitedById: 'cmj17s4ms0007o0fduw4mmbd5',
          status: 'ACCEPTED',
          respondedAt: '2025-12-11T09:09:04.603Z',
          createdAt: '2025-12-11T09:07:52.665Z',
          updatedAt: '2025-12-11T09:09:04.613Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        message:
          'You are not authorized to accept a judge invitation to this hackathon',
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
    name: 'inviteId',
    description: 'ID of the judge invitation',
    required: true,
    type: String,
    example: 'cuid',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('judges-invitations/:inviteId/accept')
  async acceptJudgeInvitation(
    @CurrentUser() user: UserMin,
    @Param('inviteId') inviteId: string,
  ) {
    return await this.judgesInvitationsService.acceptJudgeInvitation(
      inviteId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Decline a judge invitation',
    description: 'Decline a judge invitation to a hackathon.',
  })
  @ApiResponse({
    status: 200,
    description: 'Judge invitation declined successfully.',
    schema: {
      example: {
        message: 'Judge invitation declined successfully',
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
          'You are not authorized to decline a judge invitation to this hackathon',
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
    name: 'inviteId',
    description: 'ID of the judge invitation',
    required: true,
    type: String,
    example: 'cuid',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('judges/invitations/:inviteId/decline')
  async declineJudgeInvitation(
    @CurrentUser() user: UserMin,
    @Param('inviteId') inviteId: string,
  ) {
    return await this.judgesInvitationsService.declineJudgeInvitation(
      inviteId,
      user,
    );
  }
}
