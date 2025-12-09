import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementTargetType, AnnouncementVisibility } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({
    description: 'Announcement Title',
    example: 'Updated Announcement Title',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    description: 'Announcement Message',
    example: 'Updated Announcement Message',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  message?: string;

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
    description: 'Whether the announcement is pinned',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: 'Announcement Target Track ID',
    example: 'cuid',
  })
  @IsOptional()
  @IsString()
  trackId?: string;

  @ApiPropertyOptional({
    description: 'Announcement Target Bounty ID',
    example: 'cuid',
  })
  @IsOptional()
  @IsString()
  bountyId?: string;
}
