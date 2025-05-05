import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Logger,
  HttpException,
  HttpStatus,
  NotFoundException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GalleryImageService } from './galleryimage.service';
import { CreateGalleryImageDto } from './dto/create-galleryimage.dto';
import { UpdateGalleryImageDto } from './dto/update-galleryimage.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { GalleryService } from 'src/gallery/gallery.service';

@Controller('gallery-images')
export class GalleryImageController {
  private readonly logger = new Logger(GalleryImageController.name);

  constructor(
    private readonly galleryImageService: GalleryImageService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly galleryService: GalleryService,
  ) {}

  @Post()
  async create(@Body() createGalleryImageDto: CreateGalleryImageDto) {
    try {
      await this.galleryService.findOne(createGalleryImageDto.galleryId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(
          `Gallery with ID ${createGalleryImageDto.galleryId} not found. Cannot create image.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
    return this.galleryImageService.create(createGalleryImageDto);
  }

  @Get()
  async findAll(
    @Query(
      'limit',
      new DefaultValuePipe(undefined),
      new ParseIntPipe({ optional: true }),
    )
    limit?: number,
  ) {
    const safeLimit = limit && limit > 0 && limit <= 50 ? limit : undefined;
    return this.galleryImageService.findAll(safeLimit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.galleryImageService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGalleryImageDto: UpdateGalleryImageDto,
  ) {
    if (updateGalleryImageDto.galleryId) {
      try {
        await this.galleryService.findOne(updateGalleryImageDto.galleryId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new HttpException(
            `Target Gallery with ID ${updateGalleryImageDto.galleryId} not found. Cannot update image.`,
            HttpStatus.BAD_REQUEST,
          );
        }
        throw error;
      }
    }
    return this.galleryImageService.update(id, updateGalleryImageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.galleryImageService.remove(id);
  }

  @Post('bulk')
  async bulkCreate(@Body() createGalleryImageDtos: CreateGalleryImageDto[]) {
    return this.galleryImageService.bulkCreate(createGalleryImageDtos);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    this.logger.log(`Received ${files?.length} files for upload.`);
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded.', HttpStatus.BAD_REQUEST);
    }

    let targetGalleryId: string;
    try {
      const galleries = await this.galleryService.findAll();
      if (galleries && galleries.length > 0) {
        targetGalleryId = galleries[0].id;
        this.logger.log(`Using existing gallery ID: ${targetGalleryId}`);
      } else {
        const defaultGallery = await this.galleryService.create({
          title: 'Default Gallery',
          description: 'Automatically created gallery for uploads.',
        });
        targetGalleryId = defaultGallery.id;
        this.logger.log(`Created default gallery ID: ${targetGalleryId}`);
      }
    } catch (error) {
      this.logger.error('Error finding or creating default gallery:', error);
      throw new HttpException(
        'Could not determine target gallery.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const result = await this.cloudinaryService.uploadBuffer(
          file.buffer,
          undefined,
          'gallery',
        );
        return {
          galleryId: targetGalleryId,
          imageUrl: result.secure_url,
          publicId: result.public_id,
        } as CreateGalleryImageDto;
      } catch (error) {
        this.logger.error(`Failed to upload ${file.originalname}:`, error);
        throw new HttpException(
          `Failed to upload ${file.originalname}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });

    let imageDtos: CreateGalleryImageDto[];
    try {
      imageDtos = await Promise.all(uploadPromises);
    } catch (error) {
      throw error;
    }

    try {
      this.logger.log(
        `Saving ${imageDtos.length} image records to database...`,
      );
      await this.galleryImageService.bulkCreate(imageDtos);
      this.logger.log('Database records created successfully.');
      return imageDtos;
    } catch (error) {
      this.logger.error('Failed to save image records to database:', error);
      throw new HttpException(
        'Failed to save image information.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
