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
  @ApiNotFoundResponse({ description: 'Bounty not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getPrizes(
    @Param('bountyId') bountyId: string,
    @CurrentUser() user?: UserMin,
  ) {
    return this.prizesService.getBountyPrizes(bountyId, user);
  }

  @ApiOperation({
    summary: 'Manage prizes for a bounty',
    description:
      'Replace all prizes for a bounty. This endpoint uses a "replace all" pattern - you must send the complete list of desired prizes.\n\n' +
      '**Important:**\n' +
      '- Include ALL existing prizes you want to keep (with their `id` field)\n' +
      '- Prizes with an `id` will be updated\n' +
      '- Prizes without an `id` will be created\n' +
      '- Prizes not included in the request will be deleted\n' +
      '- `token` field is optional (defaults to "USD" if omitted)\n' +
      '- Organization owner only',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated list of prizes for the bounty',
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
  @ApiNotFoundResponse({ description: 'Bounty not found' })
  @ApiForbiddenResponse({ description: 'Forbidden - Only organization owner can manage prizes' })
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
