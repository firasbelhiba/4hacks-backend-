import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementTargetType, AnnouncementVisibility } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'Announcement Title',
    example: 'Announcement Title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Announcement Message',
    example: 'Announcement Message',
  })
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Announcement Link',
    example: 'https://example.com',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({
    description: 'Announcement Visibility',
    example: AnnouncementVisibility.PUBLIC,
    enum: AnnouncementVisibility,
  })
  @IsOptional()
  @IsEnum(AnnouncementVisibility)
  visibility?: AnnouncementVisibility;

  @ApiPropertyOptional({
    description: 'Announcement Target Type',
    example: AnnouncementTargetType.ALL,
    enum: AnnouncementTargetType,
  })
  @IsOptional()
  @IsEnum(AnnouncementTargetType)
  targetType?: AnnouncementTargetType;

  @ApiPropertyOptional({
    description: 'Announcement Target Track ID',
    example: 'cuid',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  trackId?: string;

  @ApiPropertyOptional({
    description: 'Announcement Target Bounty ID',
    example: 'cuid',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  bountyId?: string;
}
