import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'WEB3',
  })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'All web3 products',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
