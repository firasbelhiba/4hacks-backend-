import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { TeamApplicationStatus } from '@prisma/client';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum TeamApplicationSortField {
  CREATED_AT = 'createdAt',
  DECIDED_AT = 'decidedAt',
  STATUS = 'status',
}

export class QueryTeamApplicationsDto {
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
    description: 'Filter by team ID',
    example: 'cm4wd2xyz0000abc456',
  })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID (applicant)',
    example: 'cm4wd2xyz0000abc789',
    type: String, // Ensure type is explicitly String for Swagger
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description:
      'Filter by team leader ID - returns applications for teams where this user is a leader',
    example: 'cm4wd2xyz0000abc789',
  })
  @IsOptional()
  @IsString()
  teamLeaderId?: string;

  @ApiPropertyOptional({
    description: 'Filter by application status',
    enum: TeamApplicationStatus,
    example: TeamApplicationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TeamApplicationStatus)
  status?: TeamApplicationStatus;

  // Sorting
  @ApiPropertyOptional({
    description:
      'Field to sort by (defaults to prioritizing pending applications)',
    enum: TeamApplicationSortField,
    example: TeamApplicationSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(TeamApplicationSortField)
  sortBy?: TeamApplicationSortField;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
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

export class TeamApplicationListItemDto {
  @ApiProperty({ description: 'Application ID' })
  id: string;

  @ApiProperty({ description: 'Message' })
  message: string;

  @ApiProperty({
    description: 'Application status',
    enum: TeamApplicationStatus,
  })
  status: TeamApplicationStatus;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Decided at timestamp', nullable: true })
  decidedAt: Date | null;

  @ApiPropertyOptional({ description: 'Decider ID', nullable: true })
  decidedById: string | null;

  @ApiProperty({
    description: 'User (applicant) info',
    type: 'object',
    properties: {
      id: { type: 'string' },
      username: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      image: { type: 'string', nullable: true }, // Added image
    },
  })
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    image: string | null;
  };

  @ApiProperty({
    description: 'Position info',
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
    },
  })
  position: {
    id: string;
    title: string;
    description: string;
  };

  @ApiProperty({
    description: 'Team info',
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      hackathonId: { type: 'string' },
    },
  })
  team: {
    id: string;
    name: string;
    hackathonId: string;
  };
}

export class PaginatedTeamApplicationsDto {
  @ApiProperty({
    description: 'List of team applications',
    type: [TeamApplicationListItemDto],
  })
  data: TeamApplicationListItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  meta: PaginationMeta;
}
