import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { TeamPositionStatus } from '@prisma/client';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum TeamPositionSortField {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  STATUS = 'status',
}

export class QueryTeamPositionsDto {
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
    description: 'Filter by team ID',
    example: 'cmj45ptq703fcwofd82wy9k09',
  })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Filter by position status',
    enum: TeamPositionStatus,
    example: TeamPositionStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(TeamPositionStatus)
  status?: TeamPositionStatus;

  // Search
  @ApiPropertyOptional({
    description: 'Search in position title, description, or required skills',
    example: 'backend developer',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // Sorting
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: TeamPositionSortField,
    default: TeamPositionSortField.CREATED_AT,
    example: TeamPositionSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(TeamPositionSortField)
  sortBy?: TeamPositionSortField = TeamPositionSortField.CREATED_AT;

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

  @ApiProperty({ description: 'Total number of items', example: 50 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevPage: boolean;
}

export class TeamPositionListItemDto {
  @ApiProperty({ description: 'Position ID' })
  id: string;

  @ApiProperty({ description: 'Team ID' })
  teamId: string;

  @ApiProperty({ description: 'Creator user ID' })
  createdById: string;

  @ApiProperty({ description: 'Position title' })
  title: string;

  @ApiProperty({ description: 'Position description' })
  description: string;

  @ApiProperty({ description: 'Required skills', type: [String] })
  requiredSkills: string[];

  @ApiProperty({
    description: 'Position status',
    enum: TeamPositionStatus,
  })
  status: TeamPositionStatus;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Team info',
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      tagline: { type: 'string', nullable: true },
      image: { type: 'string', nullable: true },
      hackathonId: { type: 'string' },
    },
  })
  team: {
    id: string;
    name: string;
    tagline: string | null;
    image: string | null;
    hackathonId: string;
  };

  @ApiProperty({
    description: 'Creator info',
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      username: { type: 'string' },
      image: { type: 'string', nullable: true },
    },
  })
  createdBy: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
}

export class PaginatedTeamPositionsDto {
  @ApiProperty({
    description: 'List of team positions',
    type: [TeamPositionListItemDto],
  })
  data: TeamPositionListItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  meta: PaginationMeta;
}
