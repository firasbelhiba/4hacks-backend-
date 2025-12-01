import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterForHackathonDto {
  @ApiProperty({
    description: 'The ID of the hackathon to register for',
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  hackathonId: string;

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
        questionId: 'q1',
        answer: 'My answer to question 1',
      },
    ],
  })
  @IsOptional()
  registrationAnswers?: RegistrationAnswerDto[];
}

export class RegistrationAnswerDto {
  @ApiProperty({
    description: 'The ID of the question being answered',
    example: 'q1',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'The answer to the question',
    example: 'My answer to question 1',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
