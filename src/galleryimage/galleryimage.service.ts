import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryImageDto } from './dto/create-galleryimage.dto';
import { UpdateGalleryImageDto } from './dto/update-galleryimage.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class GalleryImageService {
  private readonly logger = new Logger(GalleryImageService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createGalleryImageDto: CreateGalleryImageDto) {
    return this.prisma.galleryImage.create({
      data: createGalleryImageDto,
    });
  }

  async findAll(limit?: number) {
    return this.prisma.galleryImage.findMany({
      take: limit,
    });
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

    if (galleryImage.publicId) {
      this.logger.log(
        `Attempting to delete Cloudinary file with publicId: ${galleryImage.publicId}`,
      );
      try {
        await this.cloudinaryService.deleteFile(galleryImage.publicId);
        this.logger.log(
          `Successfully deleted Cloudinary file: ${galleryImage.publicId}`,
        );
      } catch (cloudinaryError) {
        this.logger.error(
          `Failed to delete Cloudinary file ${galleryImage.publicId}. Error: ${cloudinaryError.message}. Proceeding with DB deletion.`,
        );
      }
    } else {
      this.logger.warn(
        `GalleryImage with ID ${id} does not have a publicId. Skipping Cloudinary deletion.`,
      );
    }

    this.logger.log(
      `Deleting GalleryImage record with ID: ${id} from database.`,
    );
    try {
      const deletedRecord = await this.prisma.galleryImage.delete({
        where: { id },
      });
      this.logger.log(
        `Successfully deleted GalleryImage record with ID: ${id}.`,
      );
      return deletedRecord;
    } catch (dbError) {
      this.logger.error(
        `Failed to delete GalleryImage record with ID ${id} from database: ${dbError.message}`,
      );
      throw dbError;
    }
  }
  async bulkCreate(createGalleryImageDtos: CreateGalleryImageDto[]) {
    return this.prisma.galleryImage.createMany({
      data: createGalleryImageDtos,
      skipDuplicates: true,
    });
  }
}
