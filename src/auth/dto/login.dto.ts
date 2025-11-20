import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: "User's email or username",
    example: 'user@example.com or johndoe',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecureP@ssw0rd!',
    format: 'password',
    required: true,
  })
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password is too weak. It must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.',
    },
  )
  password: string;
}
