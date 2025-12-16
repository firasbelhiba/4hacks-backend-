import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateBountyDto {
  @ApiProperty({
    example: 'Best DeFi Innovation',
    description: 'The title of the bounty',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Build an innovative DeFi solution that...',
    description: 'The description of the bounty',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'acme-sponsor-id',
    description:
      'The ID of the sponsor for this bounty. The sponsor must exist for this hackathon.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  sponsorId: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'The reward amount for the bounty',
    required: false,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardAmount?: number;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'The token/currency for the reward',
    required: false,
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  rewardToken?: string;

  @ApiPropertyOptional({
    example: 3,
    description:
      'Maximum number of winners for this bounty. Set to 0 for unlimited winners.',
    required: false,
    default: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxWinners?: number;
}

export class UpdateBountyDto extends PartialType(CreateBountyDto) {}

export class BountyItemDto extends CreateBountyDto {
  @ApiPropertyOptional({
    example: 'cuid',
    description: 'The ID of the bounty (if updating existing)',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
}

export class ManageBountiesDto {
  @ApiProperty({
    type: [BountyItemDto],
    description:
      'List of bounties to manage. Each bounty must have a valid sponsorId that exists for the hackathon. Send the full list - bounties not in this list will be deleted. Bounties with an id will be updated, bounties without an id will be created.',
    example: [
      {
        id: 'cuid-1',
        title: 'Best DeFi Innovation',
        description: 'Build an innovative DeFi solution',
        sponsorId: 'sponsor-id-1',
        rewardAmount: 1000,
        rewardToken: 'USD',
        maxWinners: 3,
      },
      {
        title: 'Best NFT Project',
        description: 'Create an innovative NFT project',
        sponsorId: 'sponsor-id-2',
        rewardAmount: 500,
        rewardToken: 'USD',
        maxWinners: 0, // 0 means unlimited winners
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BountyItemDto)
  bounties: BountyItemDto[];
}
