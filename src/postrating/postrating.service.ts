import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostRatingDto } from './dto/create-postrating.dto';
import { UpdatePostRatingDto } from './dto/update-postrating.dto';

@Injectable()
export class PostRatingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostRatingDto: CreatePostRatingDto) {
    return this.prisma.postRating.create({
      data: createPostRatingDto,
    });
  }

  async findAll() {
    return this.prisma.postRating.findMany();
  }

  async findOne(id: string) {
    const postRating = await this.prisma.postRating.findUnique({
      where: { id },
    });
    if (!postRating) {
      throw new NotFoundException(`PostRating with ID ${id} not found`);
    }
    return postRating;
  }

  async update(id: string, updatePostRatingDto: UpdatePostRatingDto) {
    const postRating = await this.prisma.postRating.findUnique({
      where: { id },
    });
    if (!postRating) {
      throw new NotFoundException(`PostRating with ID ${id} not found`);
    }
    return this.prisma.postRating.update({
      where: { id },
      data: updatePostRatingDto,
    });
  }

  async remove(id: string) {
    const postRating = await this.prisma.postRating.findUnique({
      where: { id },
    });
    if (!postRating) {
      throw new NotFoundException(`PostRating with ID ${id} not found`);
    }
    return this.prisma.postRating.delete({
      where: { id },
    });
  }
}
