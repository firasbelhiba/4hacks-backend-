import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsArray,
  Min,
  ArrayMinSize,
} from 'class-validator';

export enum RegistrationQuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  CHECKBOX = 'CHECKBOX',
}

export class CreateRegistrationQuestionDto {
  @ApiProperty({
    description: 'The label/text of the question',
    example: 'What is your experience level?',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({
    description: 'Additional description/context for the question',
    example: 'This helps us match you with appropriate mentors',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of the question input',
    enum: RegistrationQuestionType,
    default: RegistrationQuestionType.TEXT,
  })
  @IsEnum(RegistrationQuestionType)
  @IsOptional()
  type?: RegistrationQuestionType;

  @ApiPropertyOptional({
    description: 'Whether the question is required',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Placeholder text for TEXT/TEXTAREA inputs',
    example: 'Enter your answer here...',
  })
  @IsString()
  @IsOptional()
  placeholder?: string;

  @ApiPropertyOptional({
    description: 'Options for SELECT/MULTISELECT questions',
    example: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({
    description: 'Order of the question (for sorting)',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdateRegistrationQuestionDto {
  @ApiPropertyOptional({
    description: 'The label/text of the question',
    example: 'What is your experience level?',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({
    description: 'Additional description/context for the question',
    example: 'This helps us match you with appropriate mentors',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of the question input',
    enum: RegistrationQuestionType,
  })
  @IsEnum(RegistrationQuestionType)
  @IsOptional()
  type?: RegistrationQuestionType;

  @ApiPropertyOptional({
    description: 'Whether the question is required',
  })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Placeholder text for TEXT/TEXTAREA inputs',
    example: 'Enter your answer here...',
  })
  @IsString()
  @IsOptional()
  placeholder?: string;

  @ApiPropertyOptional({
    description: 'Options for SELECT/MULTISELECT questions',
    example: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({
    description: 'Order of the question (for sorting)',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class ReorderQuestionsDto {
  @ApiProperty({
    description: 'Array of question IDs in the desired order',
    example: ['clx1abc123', 'clx2def456', 'clx3ghi789'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  questionIds: string[];
}

export class BulkCreateQuestionsDto {
  @ApiProperty({
    description: 'Array of questions to create',
    type: [CreateRegistrationQuestionDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  questions: CreateRegistrationQuestionDto[];
}
