import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateSubmissionDto {
  @ApiPropertyOptional({
    description: 'ID of the track the submission is for',
    example: 'track_12345',
  })
  @IsOptional()
  @IsString()
  trackId?: string;

  @ApiPropertyOptional({
    description:
      'IDs of the bounties the submission is applying for. Replaces all existing bounty associations. A submission can apply to multiple bounties.',
    example: ['bounty_12345', 'bounty_67890'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bountyIds?: string[];

  @ApiPropertyOptional({
    description: 'Title of the submission',
    example: '4Hacks - Updated',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Tagline of the submission',
    example: 'Revolutionizing hackathons worldwide',
  })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({
    description: 'Description of the submission',
    example: 'An innovative platform to connect hackers worldwide.',
  })
  @IsOptional()
  @IsString()
  description?: string;

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
    example: ['React', 'Node.js', 'TypeScript'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];
}
