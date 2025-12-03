import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BountyPrizeItemDto {
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

  @ApiProperty({ description: 'Prize amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Prize token (default: USD)' })
  @IsOptional()
  @IsString()
  token?: string;
}

export class ManageBountyPrizesDto {
  @ApiProperty({
    type: [BountyPrizeItemDto],
    description: 'List of bounty prizes to manage',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BountyPrizeItemDto)
  prizes: BountyPrizeItemDto[];
}
