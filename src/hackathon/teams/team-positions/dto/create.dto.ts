import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamPositionDto {
  @ApiProperty({
    example: 'Backend Developer',
    description: 'The title of the team position',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'The team leader of the hackathon team',
    description: 'The description of the team position',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    example: '[]',
    description: 'The required skills for the team position',
  })
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  requiredSkills?: string[];
}
