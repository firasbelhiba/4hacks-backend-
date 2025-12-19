import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'ID of the team submitting the project',
    example: 'team_12345',
  })
  @IsString()
  @IsNotEmpty()
  teamId: string;

  @ApiPropertyOptional({
    description: 'ID of the track the submission is for',
    example: 'track_12345',
  })
  @IsOptional()
  @IsString()
  trackId?: string;

  @ApiPropertyOptional({
    description:
      'IDs of the bounties the submission is applying for. A submission can apply to multiple bounties.',
    example: ['bounty_12345', 'bounty_67890'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bountyIds?: string[];

  @ApiProperty({
    description: 'Title of the submission',
    example: '4Hacks',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Tagline of the submission',
    example: 'Revolutionizing hackathons',
  })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiProperty({
    description: 'Description of the submission',
    example: 'An innovative platform to connect hackers worldwide.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Logo of the submission',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    description: 'Demo URL of the submission',
    example: 'https://example.com/demo',
  })
  @IsOptional()
  @IsUrl()
  demoUrl?: string;

  @ApiPropertyOptional({
    description: 'Video URL of the submission',
    example: 'https://example.com/video',
  })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'Repository URL of the submission',
    example: 'https://github.com/example/repo',
  })
  @IsOptional()
  @IsUrl()
  repoUrl?: string;

  @ApiPropertyOptional({
    description: 'Pitch URL of the submission',
    example: 'https://example.com/pitch',
  })
  @IsOptional()
  @IsUrl()
  pitchUrl?: string;

  @ApiPropertyOptional({
    description: 'Technologies used in the submission',
    example: ['React', 'Node.js'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies?: string[];
}
