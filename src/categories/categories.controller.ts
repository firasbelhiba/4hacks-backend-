import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Find all categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  @ApiResponse({ status: 404, description: 'Categories not found' })
  @Get()
  async findAll() {
    return await this.categoriesService.findAll();
  }
}
