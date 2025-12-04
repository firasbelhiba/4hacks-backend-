import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { UpdatePrizeDto } from './dto/update-prize.dto';

@ApiBearerAuth()
@ApiTags('Hackathon Prizes')
@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @ApiOperation({
    summary: 'Update a specific prize by its ID',
    description: 'Update a specific prize by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Prize updated successfully',
    example: {
      message: 'Prize updated successfully',
      data: {
        id: '1',
        position: 1,
        name: 'First Place',
        type: 'TRACK',
        trackId: '1',
        bountyId: null,
        hackathonId: '1',
        amount: 1000,
        token: 'USD',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Prize not found' })
  @ApiForbiddenResponse({
    description: 'You are not allowed to update this prize',
  })
  @ApiBadRequestResponse({
    description: 'A prize with the specified position already exists',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':prizeId')
  async updatePrize(
    @Param('prizeId') prizeId: string,
    @Body() updatePrizeDto: UpdatePrizeDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.prizesService.updatePrize(prizeId, updatePrizeDto, user);
  }
}
