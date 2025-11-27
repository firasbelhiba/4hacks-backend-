import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  HackathonType,
  HackathonCategory,
  GeographicScope,
  FundingSource,
  SponsorLevel,
  YesNoNotApplicable,
  MarketingHelpDetails,
  EstimatedReach,
  EventLogisticsDetails,
} from 'generated/prisma';

export class CreateHackathonRequestDto {
  @ApiProperty({
    description: 'The title of the hackathon',
    example: 'Hedera Africa Hackathon 2025',
  })
  @IsString()
  @IsNotEmpty()
  hackTitle: string;

  @ApiProperty({
    description: 'The slug of the hackathon',
    example: 'hedera-africa-hackathon-2025',
  })
  @IsString()
  @IsNotEmpty()
  hackSlug: string;

  @ApiProperty({
    description: 'The ID of the organization',
    example: 'cm_123456789',
  })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({
    enum: HackathonType,
    description: 'The type of the hackathon',
    example: HackathonType.ONLINE,
  })
  @IsEnum(HackathonType)
  hackType: HackathonType;

  @ApiProperty({
    enum: HackathonCategory,
    description: 'The category of the hackathon',
    example: HackathonCategory.WEB3,
  })
  @IsEnum(HackathonCategory)
  hackCategory: HackathonCategory;

  @ApiProperty({
    description: 'The focus of the hackathon',
    example: 'Blockchain, AI, IoT',
  })
  @IsString()
  @IsNotEmpty()
  focus: string;

  @ApiProperty({
    description: 'The audience of the hackathon',
    example: 'Students, Entrepreneurs, Investors, OTHER',
  })
  @IsString()
  @IsNotEmpty()
  audience: string;

  @ApiProperty({
    description: 'The expected attendees of the hackathon',
    example: 100,
  })
  @IsInt()
  @Min(0)
  expectedAttendees: number;

  @ApiProperty({
    enum: GeographicScope,
    description: 'The geographic scope of the hackathon',
    example: GeographicScope.GLOBAL,
  })
  @IsEnum(GeographicScope)
  geographicScope: GeographicScope;

  @ApiProperty({
    description: 'The country of the hackathon',
    required: false,
    example: 'France',
  })
  @ValidateIf((o) => o.hackType !== HackathonType.ONLINE)
  @IsString()
  @IsOptional()
  hackCountry?: string;

  @ApiProperty({
    description: 'The city of the hackathon',
    required: false,
    example: 'Paris',
  })
  @ValidateIf((o) => o.hackType !== HackathonType.ONLINE)
  @IsString()
  @IsOptional()
  hackCity?: string;

  @ApiProperty({
    description: 'The state of the hackathon',
    required: false,
    example: 'Ile-de-France',
  })
  @ValidateIf((o) => o.hackType !== HackathonType.ONLINE)
  @IsString()
  @IsOptional()
  hackState?: string;

  @ApiProperty({
    description: 'The zip code of the hackathon',
    required: false,
    example: '75001',
  })
  @ValidateIf((o) => o.hackType !== HackathonType.ONLINE)
  @IsString()
  @IsOptional()
  hackZipCode?: string;

  @ApiProperty({
    description: 'The address of the hackathon',
    required: false,
    example: '123 rue de la paix',
  })
  @ValidateIf((o) => o.hackType !== HackathonType.ONLINE)
  @IsString()
  @IsOptional()
  hackAddress?: string;

  @ApiProperty({
    description: 'The start date of the hackathon',
    example: '2025-11-27T10:39:17.000Z',
  })
  @IsDateString()
  registrationStart: Date;

  @ApiProperty({
    description: 'The end date of the hackathon',
    example: '2025-11-27T10:39:17.000Z',
  })
  @IsDateString()
  registrationEnd: Date;

  @ApiProperty({
    description: 'The start date of the hackathon',
    example: '2025-11-27T10:39:17.000Z',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the hackathon',
    example: '2025-11-27T10:39:17.000Z',
  })
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    description: 'The start date of the judging',
    required: false,
    example: '2025-11-27T10:39:17.000Z',
  })
  @IsDateString()
  @IsOptional()
  judgingStart?: Date;

  @ApiProperty({
    description: 'The end date of the judging',
    required: false,
    example: '2025-11-27T10:39:17.000Z',
  })
  @IsDateString()
  @IsOptional()
  judgingEnd?: Date;

  @ApiProperty({
    description: 'The prize pool of the hackathon',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  prizePool: number;

  @ApiProperty({
    description: 'The prize token of the hackathon',
    default: 'USD',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  prizeToken: string = 'USD';

  @ApiProperty({
    description: 'The expected total winners of the hackathon',
    example: 10,
  })
  @IsInt()
  @Min(1)
  expectedTotalWinners: number;

  @ApiProperty({
    description: 'The distribution plan of the hackathon',
    example: 'Distribution plan',
  })
  @IsString()
  @IsNotEmpty()
  distributionPlan: string;

  @ApiProperty({
    description: 'The funding sources of the hackathon',
    type: [String],
    enum: FundingSource,
    isArray: true,
  })
  @IsEnum(FundingSource, { each: true })
  @IsArray()
  fundingSources: FundingSource[];

  @ApiProperty({
    description: 'The confirmed sponsors of the hackathon',
    type: [String],
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  confirmedSponsors: string[] = [];

  @ApiProperty({
    description: 'The need sponsors help of the hackathon',
    example: true,
  })
  @IsBoolean()
  needSponsorsHelp: boolean;

  @ApiProperty({
    description: 'The sponsor level of the hackathon',
    enum: SponsorLevel,
    example: SponsorLevel.ABOVE_100K,
    required: false,
  })
  @IsEnum(SponsorLevel)
  @IsOptional()
  sponsorLevel?: SponsorLevel;

  @ApiProperty({ enum: YesNoNotApplicable })
  @IsEnum(YesNoNotApplicable)
  venueSecured: YesNoNotApplicable;

  @ApiProperty({ enum: YesNoNotApplicable })
  @IsEnum(YesNoNotApplicable)
  needVenueHelp: YesNoNotApplicable;

  @ApiProperty()
  @IsBoolean()
  technicalSupport: boolean;

  @ApiProperty({ enum: YesNoNotApplicable })
  @IsEnum(YesNoNotApplicable)
  liveStreaming: YesNoNotApplicable;

  @ApiProperty()
  @IsBoolean()
  marketingHelp: boolean;

  @ApiProperty({ enum: MarketingHelpDetails, isArray: true })
  @IsEnum(MarketingHelpDetails, { each: true })
  @IsArray()
  @IsOptional()
  marketingHelpDetails: MarketingHelpDetails[] = [];

  @ApiProperty()
  @IsBoolean()
  existingCommunity: boolean;

  @ApiProperty({ enum: EstimatedReach })
  @IsEnum(EstimatedReach)
  estimatedReach: EstimatedReach;

  @ApiProperty()
  @IsInt()
  @Min(0)
  targetRegistrationGoal: number;

  @ApiProperty()
  @IsBoolean()
  needWorkshopsHelp: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  workshopsHelpDetails?: string;

  @ApiProperty()
  @IsBoolean()
  needTechnicalMentors: boolean;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  technicalMentorCount: number = 0;

  @ApiProperty()
  @IsBoolean()
  needEducationalContent: boolean;

  @ApiProperty()
  @IsBoolean()
  needSpeakers: boolean;

  @ApiProperty()
  @IsBoolean()
  needJudges: boolean;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  judgesCount: number = 0;

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  judgesProfiles: string[] = [];

  @ApiProperty()
  @IsBoolean()
  needJudgingCriteria: boolean;

  @ApiProperty()
  @IsBoolean()
  needEvaluationSystem: boolean;

  @ApiProperty()
  @IsBoolean()
  needEventLogistics: boolean;

  @ApiProperty({ enum: EventLogisticsDetails, isArray: true })
  @IsEnum(EventLogisticsDetails, { each: true })
  @IsArray()
  @IsOptional()
  eventLogisticsDetails: EventLogisticsDetails[] = [];

  @ApiProperty()
  @IsBoolean()
  needVolunteerCoordinators: boolean;

  @ApiProperty()
  @IsBoolean()
  needCommunitySetup: boolean;

  @ApiProperty()
  @IsBoolean()
  needOnCallSupport: boolean;
}
