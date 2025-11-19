import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: "Verification code sent to user's email",
    example: 123456,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  code: number;
}
