import { ApiPropertyOptional } from '@nestjs/swagger';
import { TeamPositionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTeamPositionDto {
  @ApiPropertyOptional({
    example: 'Senior Backend Developer',
    description: 'The title of the team position',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Looking for an experienced backend developer with Node.js skills',
    description: 'The description of the team position',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ['Node.js', 'TypeScript', 'PostgreSQL'],
    description: 'The required skills for the team position',
  })
  @IsOptional()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({
    example: 'OPEN',
    description: 'The status of the team position',
    enum: TeamPositionStatus,
  })
  @IsOptional()
  @IsEnum(TeamPositionStatus)
  status?: TeamPositionStatus;
}
