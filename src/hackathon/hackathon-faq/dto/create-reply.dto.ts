import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty({
    description: 'Reply content',
    example: 'Yes, you can use any EVM-compatible chain including Arbitrum and Optimism!',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({
    description: 'Array of attachment URLs (images)',
    example: ['https://example.com/image1.png'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({
    description: 'Parent reply ID (for nested replies). If not provided or empty, this is a direct reply to the thread.',
    example: 'cuid',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
