import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create.dto';
import { RolesGuard } from 'src/admin/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/admin/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateCategoryDto } from './dto/update.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Find all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    example: [
      {
        id: 'cmiy67mia0002osfdlczmv4i6',
        name: 'WEB3',
        description: 'All web3 products',
        createdAt: '2025-12-09T05:59:35.602Z',
        updatedAt: '2025-12-09T05:59:35.602Z',
      },
      {
        id: 'cmiy68du50003osfdrafk0k06',
        name: 'AI',
        description: 'All AI hackathons',
        createdAt: '2025-12-09T06:00:11.021Z',
        updatedAt: '2025-12-09T06:00:11.021Z',
      },
    ],
  })
  @ApiResponse({ status: 404, description: 'Categories not found' })
  @Get()
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @ApiOperation({
    summary: 'Add new category',
    description:
      'Add new category. This endpoint is protected by the @Admin decorator.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    example: {
      message: 'Category created successfully',
      data: {
        id: 'cmiy6lnt00000gofd1djj22k1',
        name: 'TEST2',
        description: 'All test products',
        createdAt: '2025-12-09T06:10:30.468Z',
        updatedAt: '2025-12-09T06:10:30.468Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({
    description: 'Category already exists',
    example: {
      message: 'Category already exists',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.categoriesService.create(createCategoryDto, user);
  }

  @ApiOperation({
    summary: 'Update category',
    description:
      'Update category. This endpoint is protected by the @Admin decorator.',
  })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({
    description: 'Category with this name already exists',
    example: {
      message: 'Category with this name already exists',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    example: {
      message: 'Category not found',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: UserMin,
  ) {
    return await this.categoriesService.update(id, updateCategoryDto, user);
  }

  @ApiOperation({
    summary: 'Delete category',
    description:
      'Delete category. This endpoint is protected by the @Admin decorator.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted',
    example: {
      message: 'Category deleted successfully',
      data: {
        id: 'cmiy6lnt00000gofd1djj22k1',
        name: 'TEST2',
        description: 'All test products',
        createdAt: '2025-12-09T06:10:30.468Z',
        updatedAt: '2025-12-09T06:10:30.468Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.categoriesService.delete(id);
  }
}
