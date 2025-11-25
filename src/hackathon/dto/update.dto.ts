import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HackathonCategory, HackathonType } from 'generated/prisma';

export class UpdateHackathonDto {
  @ApiProperty({
    description: 'Hackathon New title',
    example: 'Hackathon Name',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Hacathon new description ',
    example: 'Hackathon Description',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Hackathon New location',
    example: 'Nahj Sahel, Beni Khalled, Nabeul, Tunisia',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Hackathon New category',
    example: 'Hackathon Category',
    required: false,
  })
  @IsEnum(HackathonCategory)
  @IsOptional()
  category?: HackathonCategory;

  @ApiProperty({
    description: 'Hackathon New type',
    example: 'Hackathon Type',
    required: false,
  })
  @IsEnum(HackathonType)
  @IsOptional()
  type?: HackathonType;

  @ApiProperty({
    description: 'Hackathon New registration start date',
    example: 'Hackathon Registration Start Date',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  registrationStart?: Date;

  @ApiProperty({
    description: 'Hackathon New registration end date',
    example: 'Hackathon Registration End Date',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  registrationEnd?: Date;

  @ApiProperty({
    description: 'Hackathon New start date',
    example: 'Hackathon Start Date',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'Hackathon New end date',
    example: 'Hackathon End Date',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Hackathon New is private',
    example: 'Hackathon Is Private',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
