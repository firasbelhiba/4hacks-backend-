import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import {
  HackathonStatus,
  HackathonType,
  HackathonCategory,
} from '@prisma/client';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum HackathonSortField {
  CREATED_AT = 'createdAt',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  PRIZE_POOL = 'prizePool',
  TITLE = 'title',
  REGISTRATION_START = 'registrationStart',
  REGISTRATION_END = 'registrationEnd',
}

export class QueryHackathonsDto {
  // Pagination
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // Filtering
  @ApiPropertyOptional({
    description:
      'Filter by hackathon status (admin only - ignored for non-admin users)',
    enum: HackathonStatus,
    example: HackathonStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(HackathonStatus)
  status?: HackathonStatus;

  @ApiPropertyOptional({
    description: 'Filter by hackathon type',
    enum: HackathonType,
    example: HackathonType.ONLINE,
  })
  @IsOptional()
  @IsEnum(HackathonType)
  type?: HackathonType;

  @ApiPropertyOptional({
    description: 'Filter by hackathon category',
    enum: HackathonCategory,
    example: HackathonCategory.WEB3,
  })
  @IsOptional()
  @IsEnum(HackathonCategory)
  category?: HackathonCategory;

  @ApiPropertyOptional({
    description:
      'Filter by privacy status (true = invite-only, false = open registration)',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by minimum prize pool',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  prizePoolFrom?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum prize pool',
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  prizePoolTo?: number;

  @ApiPropertyOptional({
    description: 'Filter by start date (from)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (to)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by organization ID',
    example: 'cm4wd2xyz0000abc123',
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  // Search
  @ApiPropertyOptional({
    description: 'Search in hackathon title, description, or tagline',
    example: 'blockchain',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // Sorting
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: HackathonSortField,
    default: HackathonSortField.CREATED_AT,
    example: HackathonSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(HackathonSortField)
  sortBy?: HackathonSortField = HackathonSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class PaginationMeta {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevPage: boolean;
}

export class HackathonListItemDto {
  @ApiProperty({ description: 'Hackathon ID' })
  id: string;

  @ApiProperty({ description: 'Hackathon title' })
  title: string;

  @ApiProperty({ description: 'Hackathon slug' })
  slug: string;

  @ApiProperty({ description: 'Hackathon status', enum: HackathonStatus })
  status: HackathonStatus;

  @ApiProperty({ description: 'Hackathon type', enum: HackathonType })
  type: HackathonType;

  @ApiProperty({ description: 'Hackathon category', enum: HackathonCategory })
  category: HackathonCategory;

  @ApiPropertyOptional({ description: 'Banner image URL', nullable: true })
  banner: string | null;

  @ApiProperty({ description: 'Short tagline' })
  tagline: string;

  @ApiProperty({ description: 'Prize pool amount' })
  prizePool: number;

  @ApiProperty({ description: 'Prize token/currency' })
  prizeToken: string;

  @ApiProperty({ description: 'Whether hackathon requires invite passcode' })
  isPrivate: boolean;

  @ApiProperty({ description: 'Registration start date' })
  registrationStart: Date;

  @ApiProperty({ description: 'Registration end date' })
  registrationEnd: Date;

  @ApiProperty({ description: 'Hackathon start date' })
  startDate: Date;

  @ApiProperty({ description: 'Hackathon end date' })
  endDate: Date;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Organization info' })
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
}

export class PaginatedHackathonsDto {
  @ApiProperty({
    description: 'List of hackathons',
    type: [HackathonListItemDto],
  })
  data: HackathonListItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  meta: PaginationMeta;
}
