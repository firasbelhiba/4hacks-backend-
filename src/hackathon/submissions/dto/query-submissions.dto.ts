import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SubmissionSortField {
  CREATED_AT = 'createdAt',
  SUBMITTED_AT = 'submittedAt',
  TITLE = 'title',
}

export class QuerySubmissionsDto {
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
    description: 'Filter by hackathon ID',
    example: 'cm4wd2xyz0000abc123',
  })
  @IsOptional()
  @IsString()
  hackathonId?: string;

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
    description:
      'Filter by submission status (only works for admins, org owners, and team members)',
    enum: SubmissionStatus,
    example: SubmissionStatus.SUBMITTED,
  })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  // Search
  @ApiPropertyOptional({
    description: 'Search in submission title, tagline, or description',
    example: 'blockchain',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // Sorting
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: SubmissionSortField,
    default: SubmissionSortField.CREATED_AT,
    example: SubmissionSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SubmissionSortField)
  sortBy?: SubmissionSortField = SubmissionSortField.CREATED_AT;

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

export class SubmissionListItemDto {
  @ApiProperty({ description: 'Submission ID' })
  id: string;

  @ApiProperty({ description: 'Submission title' })
  title: string;

  @ApiPropertyOptional({ description: 'Submission tagline', nullable: true })
  tagline: string | null;

  @ApiProperty({ description: 'Submission description' })
  description: string;

  @ApiPropertyOptional({ description: 'Submission logo URL', nullable: true })
  logo: string | null;

  @ApiProperty({ description: 'Submission status', enum: SubmissionStatus })
  status: SubmissionStatus;

  @ApiPropertyOptional({
    description: 'Submission submitted date',
    nullable: true,
  })
  submittedAt: Date | null;

  @ApiProperty({ description: 'Technologies used', type: [String] })
  technologies: string[];

  @ApiPropertyOptional({ description: 'Demo URL', nullable: true })
  demoUrl: string | null;

  @ApiPropertyOptional({ description: 'Video URL', nullable: true })
  videoUrl: string | null;

  @ApiPropertyOptional({ description: 'Repository URL', nullable: true })
  repoUrl: string | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Hackathon info',
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      isPrivate: { type: 'boolean' },
    },
  })
  hackathon: {
    id: string;
    title: string;
    slug: string;
    isPrivate: boolean;
  };

  @ApiProperty({
    description: 'Team info',
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      image: { type: 'string', nullable: true },
    },
  })
  team: {
    id: string;
    name: string;
    image: string | null;
  };

  @ApiPropertyOptional({
    description: 'Track info',
    nullable: true,
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
    },
  })
  track: {
    id: string;
    name: string;
  } | null;

  @ApiPropertyOptional({
    description: 'Bounty info',
    nullable: true,
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
    },
  })
  bounty: {
    id: string;
    title: string;
  } | null;

  @ApiProperty({
    description: 'Creator info',
    type: 'object',
    properties: {
      id: { type: 'string' },
      username: { type: 'string' },
      name: { type: 'string' },
      image: { type: 'string', nullable: true },
    },
  })
  creator: {
    id: string;
    username: string;
    name: string;
    image: string | null;
  };
}

export class PaginatedSubmissionsDto {
  @ApiProperty({
    description: 'List of submissions',
    type: [SubmissionListItemDto],
  })
  data: SubmissionListItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  meta: PaginationMeta;
}
