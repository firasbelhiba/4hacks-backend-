import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class CreateSponsorDto {
  @ApiProperty({
    example: 'Acme Corporation',
    description: 'The name of the sponsor',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'The logo URL of the sponsor',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logo?: string;
}

export class UpdateSponsorDto extends PartialType(CreateSponsorDto) {}

export class SponsorItemDto extends CreateSponsorDto {
  @ApiProperty({
    example: 'cuid',
    description: 'The ID of the sponsor (if updating existing)',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
}

export class ManageSponsorsDto {
  @ApiProperty({
    type: [SponsorItemDto],
    description:
      'List of sponsors to manage. The first sponsor is always the organization creating the hackathon and only its logo can be updated.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SponsorItemDto)
  sponsors: SponsorItemDto[];
}
