import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Search query to match against user name, email, or username',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PublicUserDto {
  @ApiProperty({ description: 'User ID', example: 'cmiiu464o0005qsllk4qod2by' })
  id: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/image.jpg',
    nullable: true,
  })
  image: string | null;
}
