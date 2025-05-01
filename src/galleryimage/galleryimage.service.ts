import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryImageDto } from './dto/create-galleryimage.dto';
import { UpdateGalleryImageDto } from './dto/update-galleryimage.dto';

@Injectable()
export class GalleryImageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGalleryImageDto: CreateGalleryImageDto) {
    return this.prisma.galleryImage.create({
      data: createGalleryImageDto,
    });
  }

  async findAll() {
    return this.prisma.galleryImage.findMany();
  }

  async findOne(id: string) {
    const galleryImage = await this.prisma.galleryImage.findUnique({
      where: { id },
    });
    if (!galleryImage) {
      throw new NotFoundException(`GalleryImage with ID ${id} not found`);
    }
    return galleryImage;
  }

  async update(id: string, updateGalleryImageDto: UpdateGalleryImageDto) {
    const galleryImage = await this.prisma.galleryImage.findUnique({
      where: { id },
    });
    if (!galleryImage) {
      throw new NotFoundException(`GalleryImage with ID ${id} not found`);
    }
    return this.prisma.galleryImage.update({
      where: { id },
      data: updateGalleryImageDto,
    });
  }

  async remove(id: string) {
    const galleryImage = await this.prisma.galleryImage.findUnique({
      where: { id },
    });
    if (!galleryImage) {
      throw new NotFoundException(`GalleryImage with ID ${id} not found`);
    }
    return this.prisma.galleryImage.delete({
      where: { id },
    });
  }
}
