import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsNumber,
  IsNumberString,
} from 'class-validator';

export class FindHackathonRegistrationsDto {
  @ApiProperty({
    description: 'Hackathon ID to filter registrations',
    example: 'hackathon_id',
  })
  @IsString()
  hackathonId: string;

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
