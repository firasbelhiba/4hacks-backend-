import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { OrganizationType, OrganizationSize, Region } from '@prisma/client';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum OrganizationSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  DISPLAY_NAME = 'displayName',
  ESTABLISHED_YEAR = 'establishedYear',
}

export class QueryOrganizationsDto {
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
    description: 'Filter by organization type',
    enum: OrganizationType,
    example: OrganizationType.STARTUP,
  })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

  @ApiPropertyOptional({
    description: 'Filter by organization size',
    enum: OrganizationSize,
    example: OrganizationSize.ELEVEN_TO_FIFTY,
  })
  @IsOptional()
  @IsEnum(OrganizationSize)
  size?: OrganizationSize;

  @ApiPropertyOptional({
    description: 'Filter by country',
    example: 'Tunisia',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'Tunis',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by operating region',
    enum: Region,
    example: Region.AFRICA,
  })
  @IsOptional()
  @IsEnum(Region)
  operatingRegion?: Region;

  @ApiPropertyOptional({
    description: 'Filter by sector',
    example: 'Blockchain Technology',
  })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({
    description: 'Filter by established year (from)',
    example: 2020,
    minimum: 1800,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  establishedYearFrom?: number;

  @ApiPropertyOptional({
    description: 'Filter by established year (to)',
    example: 2024,
    maximum: 2100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(2100)
  establishedYearTo?: number;

  // Search
  @ApiPropertyOptional({
    description:
      'Search in organization name, displayName, slug, tagline, description, or sector',
    example: 'blockchain',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // Sorting
  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: OrganizationSortField,
    default: OrganizationSortField.CREATED_AT,
    example: OrganizationSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(OrganizationSortField)
  sortBy?: OrganizationSortField = OrganizationSortField.CREATED_AT;

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

export class PaginatedOrganizationsDto {
  @ApiProperty({ description: 'List of organizations', isArray: true })
  data: any[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  meta: PaginationMeta;
}
