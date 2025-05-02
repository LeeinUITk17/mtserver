import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlantDto: CreatePlantDto) {
    return this.prisma.plant.create({
      data: createPlantDto,
    });
  }

  async findAll() {
    return this.prisma.plant.findMany();
  }

  async findOne(id: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
    });
    if (!plant) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }
    return plant;
  }

  async update(id: string, updatePlantDto: UpdatePlantDto) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
    });
    if (!plant) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }
    return this.prisma.plant.update({
      where: { id },
      data: updatePlantDto,
    });
  }

  async remove(id: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
    });
    if (!plant) {
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }
    return this.prisma.plant.delete({
      where: { id },
    });
  }
  async bulkCreate(createPlantDtos: CreatePlantDto[]) {
    return this.prisma.plant.createMany({
      data: createPlantDtos,
      skipDuplicates: true,
    });
  }
}
