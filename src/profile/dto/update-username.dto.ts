import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUsernameDto {
  @ApiProperty({
    description: 'New username',
    example: 'newUsername',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}
