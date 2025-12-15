import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Query parameters for fetching a single thread with paginated replies.
 *
 * Replies are returned as a FLAT LIST with `parentId` field.
 * Frontend should build the tree structure client-side for proper "load more" support.
 *
 * Load More Pattern:
 * 1. First request: offset=0, limit=50 → Store replies in local array
 * 2. Load more: offset=50, limit=50 → Append to local array
 * 3. Rebuild tree from complete local array
 */
export class QueryThreadDto {
  @ApiPropertyOptional({
    description:
      'Maximum number of replies to return. Default: 50, Max: 500. Replies are returned as a flat list with parentId for frontend tree building.',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  repliesLimit?: number = 50;

  @ApiPropertyOptional({
    description:
      'Number of replies to skip (for load more). Default: 0. Increment by repliesLimit for each "load more" request.',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  repliesOffset?: number = 0;
}

