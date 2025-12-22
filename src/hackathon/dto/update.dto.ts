import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  Min,
  Max,
  ValidateNested,
  IsObject,
  ArrayMaxSize,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  HackathonType,
  HackathonStatus,
  HackathonRequiredMaterials,
} from '@prisma/client';

class LocationDto {
  @ApiPropertyOptional({ example: 'United States' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'San Francisco' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'California' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '94102' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateHackathonDto {
  @ApiPropertyOptional({
    description: 'Hackathon title',
    example: 'Web3 Innovation Hackathon 2025',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Hackathon banner image URL',
    example: 'https://example.com/banner.jpg',
  })
  @IsString()
  @IsOptional()
  banner?: string;

  @ApiPropertyOptional({
    description: 'Short tagline for the hackathon',
    example: 'Build the future of decentralized applications',
  })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Hackathon description',
    example: 'A comprehensive hackathon focused on Web3 technologies...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Hackathon category',
    example: 'Web3',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Hackathon type',
    enum: HackathonType,
    example: HackathonType.HYBRID,
  })
  @IsEnum(HackathonType)
  @IsOptional()
  type?: HackathonType;

  @ApiPropertyOptional({
    description: 'Tags for the hackathon',
    example: ['blockchain', 'defi', 'nft'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Total prize pool amount',
    example: 50000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  prizePool?: number;

  @ApiPropertyOptional({
    description: 'Prize token/currency',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  prizeToken?: string;

  @ApiPropertyOptional({
    description: 'Eligibility requirements for participants',
    example: 'Open to all developers worldwide...',
  })
  @IsString()
  @IsOptional()
  eligibilityRequirements?: string;

  @ApiPropertyOptional({
    description: 'Submission guidelines for projects',
    example: 'All projects must include a working demo...',
  })
  @IsString()
  @IsOptional()
  submissionGuidelines?: string;

  @ApiPropertyOptional({
    description: 'Resources and helpful links for participants',
    example: 'Documentation: https://..., API Keys: ...',
  })
  @IsString()
  @IsOptional()
  ressources?: string;

  @ApiPropertyOptional({
    description: 'Registration start date',
    example: '2025-05-01T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  registrationStart?: Date;

  @ApiPropertyOptional({
    description: 'Registration end date',
    example: '2025-05-31T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  registrationEnd?: Date;

  @ApiPropertyOptional({
    description: 'Hackathon start date',
    example: '2025-06-01T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Hackathon end date',
    example: '2025-06-03T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Judging start date',
    example: '2025-06-04T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  judgingStart?: Date;

  @ApiPropertyOptional({
    description: 'Judging end date',
    example: '2025-06-10T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  judgingEnd?: Date;

  @ApiPropertyOptional({
    description: 'Winner announcement date',
    example: '2025-06-15T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  winnerAnnouncementDate?: Date;

  @ApiPropertyOptional({
    description: 'Maximum team size (1 means individual only)',
    example: 4,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxTeamSize?: number;

  @ApiPropertyOptional({
    description: 'Minimum team size',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  minTeamSize?: number;

  @ApiPropertyOptional({
    description: 'Maximum tracks a project can be submitted to',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxTracksByProject?: number;

  @ApiPropertyOptional({
    description: 'Whether participants need approval to join',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiPropertyOptional({
    description: 'Whether hackathon is private (requires invite passcode)',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiPropertyOptional({
    description: 'Invite passcode for private hackathons (will be hashed)',
    example: 'secret-code-2025',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  invitePasscode?: string;

  @ApiPropertyOptional({
    description:
      'Whether submissions are publicly visible. When false, only the organizer, judges, and the submitting team can view submissions. This can be toggled at any time to control submission visibility during different phases of the hackathon.',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  areSubmissionsPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Enable project submission whitelist',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isProjectWhiteListEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Whitelisted emails for project submission',
    example: ['user1@example.com', 'user2@example.com'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  projectWhitelistEmails?: string[];

  @ApiPropertyOptional({
    description: 'Required submission materials',
    enum: HackathonRequiredMaterials,
    isArray: true,
    example: [
      HackathonRequiredMaterials.VIDEO_DEMO,
      HackathonRequiredMaterials.GITHUB_REPOSITORY,
    ],
  })
  @IsArray()
  @IsEnum(HackathonRequiredMaterials, { each: true })
  @IsOptional()
  requiredSubmissionMaterials?: HackathonRequiredMaterials[];

  @ApiPropertyOptional({
    description: 'Maximum number of custom tabs',
    example: 5,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  maxCustomTabs?: number;

  @ApiPropertyOptional({
    description: 'Primary location (for in-person or hybrid events)',
    type: LocationDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto;

  @ApiPropertyOptional({
    description: 'Additional locations for the hackathon',
    type: [LocationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  @IsOptional()
  otherLocations?: LocationDto[];

  @ApiPropertyOptional({
    description:
      'Registration questions to create/update. Use dedicated question endpoints for more control.',
    type: () => [HackathonRegistrationQuestionInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HackathonRegistrationQuestionInputDto)
  @IsOptional()
  registrationQuestions?: HackathonRegistrationQuestionInputDto[];
}

/**
 * Input DTO for registration questions when creating/updating hackathon
 * For more control, use the dedicated /hackathon/:id/registration/questions endpoints
 */
export class HackathonRegistrationQuestionInputDto {
  @ApiPropertyOptional({
    description:
      'Question ID (for updates). If not provided, a new question will be created.',
    example: 'clx1abc123',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Label or text of the question',
    example: 'What is your experience level?',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({
    description: 'Additional description/context for the question',
    example: 'This helps us match you with appropriate mentors',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of the question input',
    enum: ['TEXT', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'CHECKBOX'],
    default: 'TEXT',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Whether the question is required',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Placeholder text for TEXT/TEXTAREA inputs',
    example: 'Enter your answer here...',
  })
  @IsString()
  @IsOptional()
  placeholder?: string;

  @ApiPropertyOptional({
    description: 'Options for SELECT/MULTISELECT questions',
    example: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({
    description: 'Order of the question (for sorting)',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
