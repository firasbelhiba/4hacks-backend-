import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TeamPositionsService } from './team-positions.service';
import { CreateTeamPositionDto } from './dto/create.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Hackathon Team Positions')
@Controller('hackathon/:hackathonId/teams/:teamId/positions')
export class TeamPositionsController {
  constructor(private readonly teamPositionsService: TeamPositionsService) {}

  @ApiOperation({
    summary: 'Create a team position',
    description: 'Create a team position for your hackathon team',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('hackathonId') hackathonId: string,
    @Param('teamId') teamId: string,
    @Body() createTeamPositionDto: CreateTeamPositionDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamPositionsService.create(hackathonId, teamId, createTeamPositionDto, user);
  }
}
