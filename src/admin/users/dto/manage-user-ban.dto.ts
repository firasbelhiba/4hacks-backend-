import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ManageUserBanDto {
  @ApiPropertyOptional({
    description:
      'Reason for the action. Required for ban, optional for unban. For ban, this reason will be sent to the user via email.',
    example: 'Violation of community guidelines - spam and harassment',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

