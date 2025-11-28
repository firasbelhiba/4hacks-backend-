import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    description:
      'Reason for banning the user (required). This reason will be sent to the user via email.',
    example: 'Violation of community guidelines - spam and harassment',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

