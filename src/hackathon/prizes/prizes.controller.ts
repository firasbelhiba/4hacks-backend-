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
import { ManagePrizesDto } from './dto/manage.dto';
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
export class PrizesController {
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
    return this.prizesService.getPrizes(trackId, user);
  }

  @ApiOperation({ summary: 'Manage prizes for a track' })
  @UseGuards(JwtAuthGuard)
  @Put()
  async managePrizes(
    @Param('trackId') trackId: string,
    @Body() managePrizesDto: ManagePrizesDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.prizesService.managePrizes(trackId, managePrizesDto, user);
  }
}
