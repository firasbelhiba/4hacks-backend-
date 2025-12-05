import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class GetUserNotificationsDto {
  @ApiProperty({
    description: 'Page number',
    example: '1',
  })
  @IsNumberString()
  page: string;

  @ApiPropertyOptional({
    description: 'Limit number of notifications to return',
    example: '10',
  })
  @IsNumberString()
  @IsOptional()
  limit?: string;
}
