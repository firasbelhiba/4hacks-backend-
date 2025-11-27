import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RejectRequestDto {
  @ApiProperty({
    description: 'Reason for rejecting the hackathon request',
    example: 'The prize pool does not meet minimum requirements.',
    minLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, {
    message: 'Rejection reason must be at least 10 characters long',
  })
  reason: string;
}
