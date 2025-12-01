import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HackathonRegistrationService } from './hackathon-registration.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { RegisterForHackathonDto } from './dto/register.dto';

@ApiTags('Hackathon Registration')
@Controller('hackathon-registration')
export class HackathonRegistrationController {
  constructor(
    private readonly hackathonRegistrationService: HackathonRegistrationService,
  ) {}

  @ApiOperation({
    summary: 'Register for a hackathon',
    description:
      'Register for a hackathon. If the hackathon requires questions, they must be answered before registration is complete.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered for the hackathon',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiBadRequestResponse({
    description: 'Hackathon registration is not open',
  })
  @ApiBody({ type: RegisterForHackathonDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('')
  async registerForHackathon(
    @Body() registerDto: RegisterForHackathonDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.hackathonRegistrationService.registerForHackathon(
      user,
      registerDto,
    );
  }
}
