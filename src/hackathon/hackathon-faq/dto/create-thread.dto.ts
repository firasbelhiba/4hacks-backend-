import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateThreadDto {
  @ApiPropertyOptional({
    description: 'Question title (optional)',
    example: 'Can we use Layer 2 solutions?',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'Question content',
    example: 'I want to know if we can deploy on Arbitrum or Optimism for this hackathon.',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

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
