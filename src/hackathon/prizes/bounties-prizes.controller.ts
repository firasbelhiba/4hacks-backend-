import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { ManageTrackPrizesDto } from './dto/manage-track.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';
import { ManageBountyPrizesDto } from './dto/manage-bounty.dto';

@ApiBearerAuth()
@ApiTags('Hackathon Prizes')
@Controller('bounties/:bountyId/prizes')
export class BountiesPrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @ApiOperation({ summary: 'Get prizes for a bounty' })
  @ApiResponse({
    status: 200,
    description: 'List of prizes for the bounty',
    example: [
      {
        id: '1',
        position: 1,
        name: 'First Place',
        type: 'BOUNTY',
        bountyId: '1',
        amount: 100,
        token: 'USD',
      },
    ],
  })
  @ApiNotFoundResponse({ description: 'Track not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getPrizes(
    @Param('bountyId') bountyId: string,
    @CurrentUser() user?: UserMin,
  ) {
    return this.prizesService.getBountyPrizes(bountyId, user);
  }

  @ApiOperation({ summary: 'Manage prizes for a track' })
  @ApiResponse({
    status: 200,
    description: 'Prizes for the track',
    example: [
      {
        id: '1',
        position: 1,
        name: 'First Place',
        type: 'TRACK',
        trackId: '1',
        amount: 100,
        token: 'USD',
      },
    ],
  })
  @ApiNotFoundResponse({ description: 'Track not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @UseGuards(JwtAuthGuard)
  @Put()
  async managePrizes(
    @Param('bountyId') bountyId: string,
    @Body() managePrizesDto: ManageBountyPrizesDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.prizesService.manageBountyPrizes(
      bountyId,
      managePrizesDto,
      user,
    );
  }
}
