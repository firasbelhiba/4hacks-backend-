import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { OrganizationType, OrganizationSize, Region } from 'generated/prisma';

export class UpdateOrganizationDto {
  // Basic Information
  @ApiPropertyOptional({
    description: 'Name of the organization (unique)',
    example: 'Dar Blockchain',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the organization (unique)',
    example: 'dar-blockchain',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toLowerCase().trim())
  slug?: string;

  @ApiPropertyOptional({
    description: 'Display name - short name for the organization',
    example: 'Dar Blockchain',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Tagline of the organization',
    example: 'Building the future of blockchain in Tunisia',
  })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the organization',
    example:
      'We are a blockchain organization focused on education and innovation',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // Type and Size
  @ApiPropertyOptional({
    description: 'Type of the organization',
    enum: OrganizationType,
    example: OrganizationType.STARTUP,
  })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

  @ApiPropertyOptional({
    description: 'Year the organization was established',
    example: 2020,
    minimum: 1800,
  })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  @Type(() => Number)
  establishedYear?: number;

  @ApiPropertyOptional({
    description: 'Size of the organization',
    enum: OrganizationSize,
    example: OrganizationSize.ELEVEN_TO_FIFTY,
  })
  @IsOptional()
  @IsEnum(OrganizationSize)
  size?: OrganizationSize;

  @ApiPropertyOptional({
    description: 'Operating regions of the organization',
    enum: Region,
    isArray: true,
    example: [Region.AFRICA, Region.EUROPE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Region, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  operatingRegions?: Region[];

  // Contact Information
  @ApiPropertyOptional({
    description: 'Primary email address of the organization',
    example: 'contact@darblockchain.io',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Primary phone number of the organization',
    example: '+216 12 345 678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  // Location
  @ApiPropertyOptional({
    description: 'Country where the organization is located',
    example: 'Tunisia',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'City where the organization is located',
    example: 'Tunis',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'State/Province where the organization is located',
    example: 'Tunis',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'ZIP/Postal code',
    example: '1000',
  })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Physical address of the organization',
    example: '123 Blockchain Street',
  })
  @IsOptional()
  @IsString()
  loc_address?: string;

  // Primary Social Links
  @ApiPropertyOptional({
    description: 'Official website URL',
    example: 'https://darblockchain.io',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/company/darblockchain',
  })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'GitHub organization URL',
    example: 'https://github.com/darblockchain',
  })
  @IsOptional()
  @IsUrl()
  github?: string;

  @ApiPropertyOptional({
    description: 'Twitter/X profile URL',
    example: 'https://twitter.com/darblockchain',
  })
  @IsOptional()
  @IsUrl()
  twitter?: string;

  // Optional Social Links
  @ApiPropertyOptional({
    description: 'Discord server URL',
    example: 'https://discord.gg/darblockchain',
  })
  @IsOptional()
  @IsUrl()
  discord?: string;

  @ApiPropertyOptional({
    description: 'Telegram group/channel URL',
    example: 'https://t.me/darblockchain',
  })
  @IsOptional()
  @IsUrl()
  telegram?: string;

  @ApiPropertyOptional({
    description: 'Medium publication URL',
    example: 'https://medium.com/@darblockchain',
  })
  @IsOptional()
  @IsUrl()
  medium?: string;

  @ApiPropertyOptional({
    description: 'YouTube channel URL',
    example: 'https://youtube.com/@darblockchain',
  })
  @IsOptional()
  @IsUrl()
  youtube?: string;

  @ApiPropertyOptional({
    description: 'Facebook page URL',
    example: 'https://facebook.com/darblockchain',
  })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({
    description: 'Instagram profile URL',
    example: 'https://instagram.com/darblockchain',
  })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({
    description: 'Reddit community URL',
    example: 'https://reddit.com/r/darblockchain',
  })
  @IsOptional()
  @IsUrl()
  reddit?: string;

  @ApiPropertyOptional({
    description: 'Warpcast profile URL',
    example: 'https://warpcast.com/darblockchain',
  })
  @IsOptional()
  @IsUrl()
  warpcast?: string;

  @ApiPropertyOptional({
    description: 'Other social media links',
    type: [String],
    example: ['https://example.com/social1', 'https://example.com/social2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  otherSocials?: string[];

  // Other Optional Fields
  @ApiPropertyOptional({
    description: 'Industry sector of the organization',
    example: 'Blockchain Technology',
  })
  @IsOptional()
  @IsString()
  sector?: string;
}
