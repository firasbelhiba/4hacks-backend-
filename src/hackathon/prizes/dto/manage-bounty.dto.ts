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
  @ApiPropertyOptional({
    description:
      'Prize ID - Required if updating an existing prize. Omit this field for new prizes.',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Prize position (e.g., 1 for 1st place, 2 for 2nd place)' })
  @IsNumber()
  @Min(1)
  position: number;

  @ApiProperty({ description: 'Prize name (e.g., "First Place", "Second Place")' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Prize amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Prize token/currency (defaults to "USD" if omitted)',
  })
  @IsOptional()
  @IsString()
  token?: string;
}

export class ManageBountyPrizesDto {
  @ApiProperty({
    type: [BountyPrizeItemDto],
    description:
      'Complete list of prizes for this bounty. This replaces all existing prizes. Include existing prizes with their `id` to keep them, omit `id` for new prizes. Prizes not in this list will be deleted.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BountyPrizeItemDto)
  prizes: BountyPrizeItemDto[];
}
