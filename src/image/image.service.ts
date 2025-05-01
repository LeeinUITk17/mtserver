import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createImageDto: CreateImageDto) {
    return this.prisma.image.create({
      data: createImageDto,
    });
  }

  async findAll() {
    return this.prisma.image.findMany();
  }

  async findOne(id: string) {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  async update(id: string, updateImageDto: UpdateImageDto) {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return this.prisma.image.update({
      where: { id },
      data: updateImageDto,
    });
  }

  async remove(id: string) {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return this.prisma.image.delete({
      where: { id },
    });
  }
}
