import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateThreadDto {
  @ApiPropertyOptional({
    description: 'Question title (optional)',
    example: 'Updated: Can we use Layer 2 solutions?',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Question content',
    example: 'Updated content: I want to know if we can deploy on Arbitrum or Optimism.',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({
    description: 'Array of attachment URLs (images)',
    example: ['https://example.com/image1.png', 'https://example.com/image2.png'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
