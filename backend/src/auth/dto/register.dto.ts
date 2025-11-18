import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'Ahmed',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description:
      'Username of the user. If not provided, it will be generated from email.It will take the part before "@" in the email.',
    example: 'ahmed12',
    required: false,
  })
  @IsString({ message: 'Username must be a string' })
  username?: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'ahmed@gmail.com',
    format: 'email',
    required: true,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'Ahmed@1234',
    required: true,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
