import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { SetPrizeWinnerDto } from './dto/set-prize-winner.dto';

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

  @ApiOperation({
    summary: 'Set the winner for a specific prize',
    description:
      'Allows the hackathon organizer or admin to specify which submission won a particular prize. ' +
      'The submission must be in SUBMITTED status and must belong to the same hackathon. ' +
      'For track prizes, the submission must be participating in the same track. ' +
      'For bounty prizes, the submission must be for the same bounty. ' +
      'This endpoint will create a PrizeWinner record and mark the submission as a winner.',
  })
  @ApiResponse({
    status: 201,
    description: 'Prize winner set successfully',
    example: {
      message: 'Prize winner set successfully',
      data: {
        id: 'clx1234567890abcdefgh',
        prizeId: 'clx0987654321zyxwvuts',
        submissionId: 'clx1111222233334444',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        submission: {
          id: 'clx1111222233334444',
          title: 'Amazing Project',
          team: {
            id: 'clx5555666677778888',
            name: 'Team Awesome',
          },
        },
        prize: {
          id: 'clx0987654321zyxwvuts',
          name: 'First Place',
          position: 1,
          amount: 5000,
          token: 'USD',
          type: 'TRACK',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Prize or submission not found',
  })
  @ApiForbiddenResponse({
    description:
      'You are not allowed to set winners for this prize. Only the hackathon organizer or admin can perform this action.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request. Possible reasons: ' +
      '1) Submission does not belong to the same hackathon as the prize, ' +
      '2) Submission status is not SUBMITTED (could be DRAFT, REJECTED, or WITHDRAWN), ' +
      '3) For track prizes: submission is not participating in the same track, ' +
      '4) For bounty prizes: submission is not for the same bounty, ' +
      '5) This submission is already set as the winner for this prize',
  })
  @UseGuards(JwtAuthGuard)
  @Post(':prizeId/winner')
  async setPrizeWinner(
    @Param('prizeId') prizeId: string,
    @Body() setPrizeWinnerDto: SetPrizeWinnerDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.prizesService.setPrizeWinner(prizeId, setPrizeWinnerDto, user);
  }
}
