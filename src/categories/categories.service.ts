import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create.dto';
import type { UserMin } from 'src/common/types';
import { UpdateCategoryDto } from './dto/update.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.hackathonCategory.findMany();
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, description } = createCategoryDto;

    // Find if category already exists
    const category = await this.prismaService.hackathonCategory.findUnique({
      where: {
        name: name.toUpperCase(),
      },
    });

    if (category) {
      throw new ConflictException('Category already exists');
    }

    const newCategory = await this.prismaService.hackathonCategory.create({
      data: {
        name: name.toUpperCase(),
        description,
      },
    });

    return {
      message: 'Category created successfully',
      data: newCategory,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, description } = updateCategoryDto;

    // Find if category already exists
    const category = await this.prismaService.hackathonCategory.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (name) {
      category.name = name.toUpperCase();

      // Find if category already exists
      const existingCategory =
        await this.prismaService.hackathonCategory.findFirst({
          where: {
            name: name.toUpperCase(),
            id: {
              not: id,
            },
          },
        });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    if (description) {
      category.description = description;
    }

    const updatedCategory = await this.prismaService.hackathonCategory.update({
      where: {
        id,
      },
      data: {
        name: category.name,
        description: category.description,
      },
    });

    return {
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  async delete(id: string) {
    const category = await this.prismaService.hackathonCategory.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const deletedCategory = await this.prismaService.hackathonCategory.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Category deleted successfully',
      data: deletedCategory,
    };
  }
}
