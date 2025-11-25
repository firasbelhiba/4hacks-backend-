import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HackathonCategory, HackathonType } from 'generated/prisma';

const UTC_REGEX = /Z$/;

export class CreateHackathonDto {
  @ApiProperty({
    example: 'cuid',
    description: 'CUID Organization ID of the hackathon',
    required: true,
  })
  @IsString()
  organizationId: string;

  @ApiProperty({
    example: 'Hackathon Title',
    description: 'The title of the hackathon',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'hackathon-slug',
    description: 'The slug of the hackathon',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'WEB3',
    description: 'The category of the hackathon',
    enum: HackathonCategory,
  })
  @IsEnum(HackathonCategory)
  category: HackathonCategory;

  @ApiProperty({
    example: false,
    description: 'Whether the hackathon is private',
  })
  @IsBoolean()
  isPrivate: boolean;

  @ApiProperty({
    example: 'VIRTUAL',
    description: 'The type of the hackathon',
    enum: HackathonType,
  })
  @IsEnum(HackathonType)
  type: HackathonType;

  @ApiProperty({
    example: '2025-11-25T10:17:49.000Z',
    description: 'Registration start date (UTC)',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  registrationStart: Date;

  @ApiProperty({
    example: '2025-11-25T10:17:49.000Z',
    description: 'Registration end date (UTC)',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  registrationEnd: Date;

  @ApiProperty({
    example: '2025-11-25T10:17:49.000Z',
    description: 'Hackathon submission start date (UTC)',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    example: '2025-11-25T10:17:49.000Z',
    description: 'Hackathon submission end date (UTC)',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
