import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class FindHackathonTeamsDto {
  @ApiPropertyOptional({
    description: 'Search by team name or tagline',
    example: 'awesome team',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @IsOptional()
  @IsNumberString({})
  page?: string = '1';

  @ApiPropertyOptional({
    description: 'Items per page (max 100)',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';
}
