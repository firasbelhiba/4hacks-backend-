import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { OrganizationType, OrganizationSize, Region } from 'generated/prisma';

export class CreateOrganizationDto {
  // Basic Information
  @ApiProperty({
    description: 'Name of the organization (unique)',
    example: 'Dar Blockchain',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug for the organization (unique)',
    example: 'dar-blockchain',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toLowerCase().trim())
  slug: string;

  @ApiProperty({
    description: 'Display name - short name for the organization',
    example: 'Dar Blockchain',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiPropertyOptional({
    description: 'Tagline of the organization',
    example: 'Building the future of blockchain in Tunisia',
    required: false,
  })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the organization',
    example:
      'We are a blockchain organization focused on education and innovation',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  // Type and Size
  @ApiProperty({
    description: 'Type of the organization',
    enum: OrganizationType,
    example: OrganizationType.STARTUP,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiProperty({
    description: 'Year the organization was established',
    example: 2020,
    minimum: 1800,
    maximum: new Date().getFullYear(),
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  @Type(() => Number)
  establishedYear: number;

  @ApiProperty({
    description: 'Size of the organization',
    enum: OrganizationSize,
    example: OrganizationSize.ELEVEN_TO_FIFTY,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(OrganizationSize)
  size: OrganizationSize;

  @ApiProperty({
    description: 'Operating regions of the organization',
    enum: Region,
    isArray: true,
    example: [Region.AFRICA, Region.EUROPE],
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @IsEnum(Region, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  operatingRegions: Region[];

  // Contact Information
  @ApiProperty({
    description: 'Primary email address of the organization',
    example: 'contact@darblockchain.io',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Primary phone number of the organization',
    example: '+216 12 345 678',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  // Location
  @ApiProperty({
    description: 'Country where the organization is located',
    example: 'Tunisia',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    description: 'City where the organization is located',
    example: 'Tunis',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional({
    description: 'State/Province where the organization is located',
    example: 'Tunis',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'ZIP/Postal code',
    example: '1000',
    required: false,
  })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Physical address of the organization',
    example: '123 Blockchain Street',
    required: false,
  })
  @IsOptional()
  @IsString()
  loc_address?: string;

  // Primary Social Links (Required)
  @ApiProperty({
    description: 'Official website URL',
    example: 'https://darblockchain.io',
    required: true,
  })
  @IsNotEmpty()
  @IsUrl()
  website: string;

  @ApiProperty({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/company/darblockchain',
    required: true,
  })
  @IsNotEmpty()
  @IsUrl()
  linkedin: string;

  @ApiProperty({
    description: 'GitHub organization URL',
    example: 'https://github.com/darblockchain',
    required: true,
  })
  @IsNotEmpty()
  @IsUrl()
  github: string;

  @ApiProperty({
    description: 'Twitter/X profile URL',
    example: 'https://twitter.com/darblockchain',
    required: true,
  })
  @IsNotEmpty()
  @IsUrl()
  twitter: string;

  // Optional Social Links
  @ApiPropertyOptional({
    description: 'Discord server URL',
    example: 'https://discord.gg/darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  discord?: string;

  @ApiPropertyOptional({
    description: 'Telegram group/channel URL',
    example: 'https://t.me/darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  telegram?: string;

  @ApiPropertyOptional({
    description: 'Medium publication URL',
    example: 'https://medium.com/@darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  medium?: string;

  @ApiPropertyOptional({
    description: 'YouTube channel URL',
    example: 'https://youtube.com/@darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  youtube?: string;

  @ApiPropertyOptional({
    description: 'Facebook page URL',
    example: 'https://facebook.com/darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({
    description: 'Instagram profile URL',
    example: 'https://instagram.com/darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({
    description: 'Reddit community URL',
    example: 'https://reddit.com/r/darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  reddit?: string;

  @ApiPropertyOptional({
    description: 'Warpcast profile URL',
    example: 'https://warpcast.com/darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  warpcast?: string;

  @ApiPropertyOptional({
    description: 'Other social media links',
    type: [String],
    example: ['https://example.com/social1', 'https://example.com/social2'],
    required: false,
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
    required: false,
  })
  @IsOptional()
  @IsString()
  sector?: string;
}
