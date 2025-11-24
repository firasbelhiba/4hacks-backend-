import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Name of the organization',
    example: 'Dar Blockchain',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Slug of the organization',
    example: 'darblockchain',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  slug: string;

  @ApiProperty({
    description: 'Tagline of the organization',
    example: 'The first blockchain organization in Tunisia',
    required: false,
  })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiProperty({
    description: 'Description of the organization',
    example: 'We are a blockchain organization',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Location of the organization',
    example: 'Tunis, Tunisia',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Website of the organization',
    example: 'https://darblockchain.io',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Github of the organization',
    example: 'https://github.com/darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  github?: string;

  @ApiProperty({
    description: 'Twitter of the organization',
    example: 'https://twitter.com/darblockchain',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  twitter?: string;
}
