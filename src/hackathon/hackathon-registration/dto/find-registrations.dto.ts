import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';

export class FindHackathonRegistrationsDto {
  @ApiPropertyOptional({
    description: 'Search by user name, username or email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumberString({})
  page?: string = '1';

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';
}
