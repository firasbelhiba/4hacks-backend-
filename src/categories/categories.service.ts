import { ConflictException, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create.dto';
import type { UserMin } from 'src/common/types';

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

    return await this.prismaService.hackathonCategory.create({
      data: {
        name: name.toUpperCase(),
        description,
      },
    });
  }
}
