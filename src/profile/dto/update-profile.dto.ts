import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  MaxLength,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'User biography or description',
    example: 'Full-stack developer passionate about blockchain and AI',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'User profession or job title',
    example: 'Senior Software Engineer',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  profession?: string;

  @ApiPropertyOptional({
    description: 'User location (city, country)',
    example: 'San Francisco, USA',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({
    description: 'Organization name (school, company, etc.)',
    example: 'Google',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  org?: string;

  @ApiPropertyOptional({
    description: 'Array of user skills',
    example: ['JavaScript', 'TypeScript', 'React', 'NestJS'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return value;
  })
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Personal website URL',
    example: 'https://johndoe.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'GitHub profile URL or username',
    example: 'https://github.com/johndoe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  github?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL or username',
    example: 'https://linkedin.com/in/johndoe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'Telegram username',
    example: '@johndoe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  telegram?: string;

  @ApiPropertyOptional({
    description: 'Twitter/X username or URL',
    example: 'https://twitter.com/johndoe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  twitter?: string;

  @ApiPropertyOptional({
    description: 'WhatsApp number with country code',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'WhatsApp must be a valid phone number with country code',
  })
  whatsapp?: string;

  @ApiPropertyOptional({
    description: 'Array of other social media links',
    example: ['https://instagram.com/johndoe', 'https://youtube.com/@johndoe'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return value;
  })
  otherSocials?: string[];
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'New password must contain at least one letter and one number',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class TwoFactorCodeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/)
  code: string;
}
