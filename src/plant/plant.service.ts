import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlantService {
  private readonly logger = new Logger(PlantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createPlantDto: CreatePlantDto,
    imageDatas?: Prisma.ImageCreateManyInput[],
  ) {
    this.logger.log(`Creating plant: ${createPlantDto.name}`);

    let priceAsNumber: number | undefined = undefined;
    let stockAsInt: number | undefined = undefined;

    if (createPlantDto.price !== undefined && createPlantDto.price !== null) {
      priceAsNumber = Number(createPlantDto.price);
      if (isNaN(priceAsNumber)) {
        this.logger.error(
          `Invalid price value received: ${createPlantDto.price}`,
        );
        throw new BadRequestException(
          `Giá trị Price không hợp lệ: "${createPlantDto.price}".`,
        );
      }
    }

    if (createPlantDto.stock !== undefined && createPlantDto.stock !== null) {
      stockAsInt = parseInt(String(createPlantDto.stock), 10);
      if (isNaN(stockAsInt)) {
        this.logger.error(
          `Invalid stock value received: ${createPlantDto.stock}`,
        );
        throw new BadRequestException(
          `Giá trị Stock không hợp lệ: "${createPlantDto.stock}".`,
        );
      }
    }

    try {
      const createdPlant = await this.prisma.plant.create({
        data: {
          name: createPlantDto.name,
          description: createPlantDto.description,
          price: priceAsNumber,
          stock: stockAsInt,
          categoryId: createPlantDto.categoryId,
          imageUrl: createPlantDto.imageUrl,
          images: imageDatas
            ? {
                createMany: {
                  data: imageDatas,
                  skipDuplicates: true,
                },
              }
            : undefined,
        },
        include: { images: true },
      });
      this.logger.log(`Plant created successfully with ID: ${createdPlant.id}`);
      return createdPlant;
    } catch (error) {
      this.logger.error(
        `Failed to create plant: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `A plant with this name might already exist.`,
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(`Invalid category ID provided.`);
        }
        if (
          error.message.includes('Expected Int, provided String') ||
          error.message.includes('Expected Decimal, provided String')
        ) {
          throw new BadRequestException(
            'Invalid data type for price or stock.',
          );
        }
      }
      throw error;
    }
  }

  async findAll(limit?: number) {
    this.logger.log(`Finding all plants${limit ? ` (limit: ${limit})` : ''}`);
    return this.prisma.plant.findMany({
      take: limit,
      include: {
        images: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    this.logger.log(`Finding plant with ID: ${id}`);
    const plant = await this.prisma.plant.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
      },
    });
    if (!plant) {
      this.logger.warn(`Plant with ID ${id} not found`);
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }
    return plant;
  }

  async update(id: string, updatePlantDto: UpdatePlantDto) {
    this.logger.log(`Updating plant with ID: ${id}`);
    await this.findOne(id);
    try {
      const updatedPlant = await this.prisma.plant.update({
        where: { id },
        data: updatePlantDto,
        include: { images: true },
      });
      this.logger.log(`Plant ${id} updated successfully.`);
      return updatedPlant;
    } catch (error) {
      this.logger.error(
        `Failed to update plant ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new NotFoundException(
            `Update failed: A plant with the updated name might already exist.`,
          );
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(
            `Update failed: Invalid category ID provided.`,
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.log(`Attempting to remove plant with ID: ${id}`);
    const plant = await this.prisma.plant.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!plant) {
      this.logger.warn(`Plant with ID ${id} not found for deletion.`);
      throw new NotFoundException(`Plant with ID ${id} not found`);
    }

    if (plant.images && plant.images.length > 0) {
      this.logger.log(
        `Deleting ${plant.images.length} associated images from Cloudinary for plant ${id}.`,
      );
      const deletePromises = plant.images
        .filter((img) => img.publicId)
        .map((img) =>
          this.cloudinaryService.deleteFile(img.publicId).catch((err) => {
            this.logger.error(
              `Failed to delete Cloudinary file ${img.publicId}: ${err.message}`,
              err.stack,
            );
          }),
        );
      await Promise.all(deletePromises);
    } else {
      this.logger.log(
        `No associated images with publicIds found for plant ${id}. Skipping Cloudinary deletion.`,
      );
    }

    try {
      this.logger.log(`Deleting plant record ${id} from database.`);
      const deletedPlant = await this.prisma.plant.delete({
        where: { id },
      });
      this.logger.log(`Successfully deleted plant ${id}.`);
      return deletedPlant;
    } catch (error) {
      this.logger.error(
        `Failed to delete plant ${id} from database: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async bulkCreate(createPlantDtos: CreatePlantDto[]) {
    this.logger.log(`Bulk creating ${createPlantDtos.length} plants.`);
    return this.prisma.plant.createMany({
      data: createPlantDtos,
      skipDuplicates: true,
    });
  }
}
