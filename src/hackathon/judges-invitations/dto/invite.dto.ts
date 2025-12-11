import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InviteJudgeDto {
  @ApiProperty({
    description: 'Judge user ID',
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
  judgeId: string;
}
