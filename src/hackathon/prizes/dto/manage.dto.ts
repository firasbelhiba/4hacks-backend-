import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PrizeType } from 'generated/prisma';

export class PrizeItemDto {
  @ApiPropertyOptional({ description: 'Prize ID (if updating existing prize)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Prize position (e.g., 1 for 1st place)' })
  @IsNumber()
  @Min(1)
  position: number;

  @ApiProperty({ description: 'Prize name (e.g., "First Place")' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PrizeType, description: 'Type of prize' })
  @IsEnum(PrizeType)
  type: PrizeType;

  @ApiPropertyOptional({ description: 'Track ID (required if type is TRACK)' })
  @IsOptional()
  @IsString()
  trackId?: string;

  @ApiPropertyOptional({
    description: 'Bounty ID (required if type is BOUNTY)',
  })
  @IsOptional()
  @IsString()
  bountyId?: string;

  @ApiProperty({ description: 'Prize amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Prize token (default: USD)' })
  @IsOptional()
  @IsString()
  token?: string;
}

export class ManagePrizesDto {
  @ApiProperty({
    type: [PrizeItemDto],
    description: 'List of prizes to manage',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrizeItemDto)
  prizes: PrizeItemDto[];
}
