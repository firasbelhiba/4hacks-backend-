import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SetPrizeWinnerDto {
  @ApiProperty({
    description: 'The ID of the submission that won this prize',
    example: 'clx1234567890abcdefgh',
  })
  @IsNotEmpty()
  @IsString()
  submissionId: string;
}
