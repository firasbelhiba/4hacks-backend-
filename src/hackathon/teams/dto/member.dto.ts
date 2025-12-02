import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TeamMemberDto {
  @ApiProperty({
    description: 'Username or email of the user to add to the team',
  })
  @IsString()
  @IsNotEmpty()
  member_identifier: string;
}
