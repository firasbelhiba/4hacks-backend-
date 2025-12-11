import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MAX_SCORE, MIN_SCORE } from '../const';

export class UpdateSubmissionScoreDto {
  @ApiPropertyOptional({
    description: 'The score of the submission',
    example: 6,
  })
  @IsNumber()
  @Max(MAX_SCORE)
  @Min(MIN_SCORE)
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({
    description: 'The comment of the submission',
    example: 'The submission is great',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string;

  @ApiPropertyOptional({
    description: 'The criteria scores of the submission',
    example: '{ "innovation": 8, "feasibility": 7, "presentation": 9 }',
  })
  @IsOptional()
  @IsObject()
  @IsNotEmpty()
  criteriaScores?: Record<string, number>;
}
