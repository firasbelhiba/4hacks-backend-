import { ApiProperty } from '@nestjs/swagger';

export class OrganisationPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ required: false })
  logo?: string;

  @ApiProperty({ required: false })
  tagline?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  linkedin?: string;

  @ApiProperty({ required: false })
  github?: string;

  @ApiProperty({ required: false })
  twitter?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrganisationPrivateDto extends OrganisationPublicDto {
  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  ownerId?: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  loc_address?: string;

  @ApiProperty({ required: false })
  otherSocials?: string[];
}
