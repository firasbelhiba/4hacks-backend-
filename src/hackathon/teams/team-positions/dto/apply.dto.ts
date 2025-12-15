import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MIN_APPLY_MESSAGE_LENGTH } from '../const';

export class ApplyToTeamPositionDto {
  @ApiProperty({
    description:
      'Message to the team, where you talk about yourself and why you want to join the team',
    example: 'I am a great developer and I want to join the team',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(MIN_APPLY_MESSAGE_LENGTH)
  message: string;
}
