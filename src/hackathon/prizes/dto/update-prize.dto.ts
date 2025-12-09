import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePrizeDto {
  @ApiPropertyOptional({
    description: 'Prize position (e.g., 1 for 1st place)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  position?: number;

  @ApiPropertyOptional({ description: 'Prize name (e.g., "First Place")' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Prize amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Prize token (default: USD)' })
  @IsOptional()
  @IsString()
  token?: string;
}
