import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum SubmissionScoreSortField {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  AVERAGE_SCORE = 'averageScore',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QuerySubmissionScoresDto {
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
    description: 'Filter by track ID',
    example: 'cm4wd2xyz0000abc456',
  })
  @IsOptional()
  @IsString()
  trackId?: string;

  @ApiPropertyOptional({
    description: 'Filter by bounty ID',
    example: 'cm4wd2xyz0000abc789',
  })
  @IsOptional()
  @IsString()
  bountyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by submission status',
    enum: SubmissionStatus,
    example: SubmissionStatus.SUBMITTED,
  })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @ApiPropertyOptional({
    description:
      'Filter by scored status. true = only submissions with scores, false = only submissions missing scores',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  scored?: boolean;

  // Search
  @ApiPropertyOptional({
    description: 'Search in submission title',
    example: 'blockchain',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // Sorting
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: SubmissionScoreSortField,
    default: SubmissionScoreSortField.CREATED_AT,
    example: SubmissionScoreSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SubmissionScoreSortField)
  sortBy?: SubmissionScoreSortField = SubmissionScoreSortField.CREATED_AT;

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
