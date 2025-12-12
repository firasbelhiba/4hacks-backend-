import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateReplyDto {
  @ApiPropertyOptional({
    description: 'Reply content',
    example: 'Updated: Yes, you can use any EVM-compatible chain including Arbitrum and Optimism!',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({
    description: 'Array of attachment URLs (images)',
    example: ['https://example.com/image1.png'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
