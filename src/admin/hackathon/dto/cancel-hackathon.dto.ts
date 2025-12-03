import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CancelHackathonDto {
  @ApiProperty({
    description: 'Reason for cancelling the hackathon',
    example: 'Violation of platform guidelines',
    minLength: 10,
  })
  @IsNotEmpty({ message: 'Cancellation reason is required' })
  @IsString()
  @MinLength(10, {
    message: 'Cancellation reason must be at least 10 characters',
  })
  reason: string;
}

