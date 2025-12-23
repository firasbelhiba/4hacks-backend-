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

@ApiBearerAuth()
@ApiTags('Hackathon Prizes')
@Controller('tracks/:trackId/prizes')
export class TracksPrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @ApiOperation({ summary: 'Get prizes for a track' })
  @ApiResponse({
    status: 200,
    description: 'List of prizes for the track',
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
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getPrizes(
    @Param('trackId') trackId: string,
    @CurrentUser() user?: UserMin,
  ) {
    return this.prizesService.getTrackPrizes(trackId, user);
  }

  @ApiOperation({
    summary: 'Manage prizes for a track',
    description:
      'Replace all prizes for a track. This endpoint uses a "replace all" pattern - you must send the complete list of desired prizes.\n\n' +
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
    description: 'Updated list of prizes for the track',
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
  @ApiForbiddenResponse({ description: 'Forbidden - Only organization owner can manage prizes' })
  @UseGuards(JwtAuthGuard)
  @Put()
  async managePrizes(
    @Param('trackId') trackId: string,
    @Body() managePrizesDto: ManageTrackPrizesDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.prizesService.manageTrackPrizes(trackId, managePrizesDto, user);
  }
}
