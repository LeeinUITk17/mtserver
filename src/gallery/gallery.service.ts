import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGalleryDto: CreateGalleryDto) {
    return this.prisma.gallery.create({
      data: createGalleryDto,
    });
  }

  async findAll() {
    return this.prisma.gallery.findMany();
  }

  async findOne(id: string) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
    });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found`);
    }
    return gallery;
  }

  async update(id: string, updateGalleryDto: UpdateGalleryDto) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
    });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found`);
    }
    return this.prisma.gallery.update({
      where: { id },
      data: updateGalleryDto,
    });
  }

  async remove(id: string) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
    });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID ${id} not found`);
    }
    return this.prisma.gallery.delete({
      where: { id },
    });
  }
}
