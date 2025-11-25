import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateTrackDto {
  @ApiProperty({
    example: 'DeFi Track',
    description: 'The name of the track',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Build the future of finance...',
    description: 'The description of the track',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Innovation, Technicality, Design...',
    description: 'The judging criteria for the track',
    required: false,
  })
  @IsOptional()
  @IsString()
  judgingCriteria?: string;

  @ApiProperty({
    example: 1,
    description: 'The order of the track',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateTrackDto extends PartialType(CreateTrackDto) {}

export class TrackItemDto extends CreateTrackDto {
  @ApiProperty({
    example: 'cuid',
    description: 'The ID of the track (if updating existing)',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
}

export class ManageTracksDto {
  @ApiProperty({
    type: [TrackItemDto],
    description: 'List of tracks to manage',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackItemDto)
  tracks: TrackItemDto[];
}
