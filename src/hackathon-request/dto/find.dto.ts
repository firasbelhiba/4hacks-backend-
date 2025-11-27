import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindByOrganizationDto {
  @ApiProperty({
    description: 'Organization identifier (id, slug, or name)',
    example: 'dar-blockchain',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  org: string;
}
