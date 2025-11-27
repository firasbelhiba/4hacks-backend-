import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';
import { RequestStatus } from 'generated/prisma';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum HackathonRequestSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  HACK_TITLE = 'hackTitle',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  EXPECTED_ATTENDEES = 'expectedAttendees',
  PRIZE_POOL = 'prizePool',
}

export class QueryHackathonRequestsDto {
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
    description: 'Filter by request status',
    enum: RequestStatus,
    example: RequestStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({
    description: 'Filter by organization ID',
    example: 'cm4wd2xyz0000abc123',
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Search in hackathon title',
    example: 'Web3 Hackathon',
  })
  @IsOptional()
  @IsString()
  search?: string;

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

  // Sorting
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: HackathonRequestSortField,
    default: HackathonRequestSortField.CREATED_AT,
    example: HackathonRequestSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(HackathonRequestSortField)
  sortBy?: HackathonRequestSortField = HackathonRequestSortField.CREATED_AT;

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
