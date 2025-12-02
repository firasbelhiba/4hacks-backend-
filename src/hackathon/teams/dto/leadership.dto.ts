import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TransferTeamLeadershipDto {
  @ApiProperty({
    description: 'The username or the email of the new team leader',
    example: 'ayoubbuoya',
  })
  @IsString()
  @IsNotEmpty()
  newLeaderIdentifier: string;
}
