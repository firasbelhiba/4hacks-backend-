import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterForHackathonDto {
  @ApiPropertyOptional({
    description: "PassCode for private hackathons' registration",
    example: '124578',
  })
  @IsString()
  @IsOptional()
  passCode?: string;

  @ApiPropertyOptional({
    description: 'Answers to the hackathon registration questions',
    example: [
      {
        questionId: 'clx1abc123',
        value: ['Advanced'],
      },
      {
        questionId: 'clx2def456',
        value: ['DeFi', 'Gaming'],
      },
    ],
    type: () => [RegistrationAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistrationAnswerDto)
  @IsOptional()
  answers?: RegistrationAnswerDto[];
}

export class RegistrationAnswerDto {
  @ApiProperty({
    description: 'The ID of the question being answered (cuid)',
    example: 'clx1abc123',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description:
      'The answer value(s). Use array for multiselect, single-element array for other types.',
    example: ['Advanced'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  value: string[];
}
