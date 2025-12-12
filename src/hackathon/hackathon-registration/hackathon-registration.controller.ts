import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
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
import { FindHackathonRegistrationsDto } from './dto/find-registrations.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';

@ApiTags('Hackathon Registration')
@Controller('hackathon/:hackathonId/registration')
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
    @Param('hackathonId') hackathonId: string,
    @Body() registerDto: RegisterForHackathonDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.hackathonRegistrationService.registerForHackathon(
      hackathonId,
      user,
      registerDto,
    );
  }

  @ApiOperation({
    summary: 'Get all registered users for a specific hackathon',
    description: `Returns paginated list of users registered for a given hackathon. Supports search by user name or email.

**Access Control:**
- **Public hackathons**: Anyone can view registrations (unauthenticated users see basic info only)
- **Private hackathons**: 
  - Admins and organizers can always view (with full details including answers)
  - Registered users with APPROVED status can view (without answers)
  - Others cannot access

**Response varies by user role:**
- **Admins & Organizers**: See all fields including registration answers, reviewedAt, reviewedById
- **Regular users**: See basic info only (id, status, user, registeredAt) - no answers
- **Unauthenticated users**: Same as regular users (for public hackathons only)`,
  })
  @ApiResponse({
    status: 200,
    description:
      'Paginated list of registered users. Response structure varies based on user role: admins/organizers see answers, regular users see basic info only.',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiBadRequestResponse({
    description:
      'Access denied. For private hackathons, you must be registered and approved to view registrations.',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('')
  async getHackathonRegisteredUsers(
    @Param('hackathonId') hackathonId: string,
    @Query() query: FindHackathonRegistrationsDto,
    @CurrentUser() user?: UserMin,
  ) {
    return await this.hackathonRegistrationService.getHackathonRegisteredUsers(
      hackathonId,
      query,
      user,
    );
  }
}
