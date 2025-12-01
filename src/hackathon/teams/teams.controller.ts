import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateTeamDto } from './dto/create.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';

@ApiTags('Hackathon Teams')
@Controller('hackathon/:hackathonId/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @ApiOperation({
    summary: 'Create a team',
    description:
      'Create a team for a hackathon. User must be registered for the hackathon and not already in a team. Team name must be unique for the hackathon.',
  })
  @ApiBody({ type: CreateTeamDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('')
  async createTeam(
    @Param('hackathonId') hackathonId: string,
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.teamsService.createTeam(hackathonId, user, createTeamDto);
  }
}
