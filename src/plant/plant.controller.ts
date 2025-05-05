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
  HttpException,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';

@Controller('plants')
export class PlantController {
  private readonly logger = new Logger(PlantController.name);

  constructor(
    private readonly plantService: PlantService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createPlantDto: CreatePlantDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    this.logger.log(
      `Received request to create plant: ${createPlantDto.name} with ${files?.length || 0} images.`,
    );

    let imageDatas: Prisma.ImageCreateManyInput[] = [];

    if (files && files.length > 0) {
      this.logger.log(`Uploading ${files.length} images to Cloudinary...`);
      try {
        const uploadPromises = files.map((file) =>
          this.cloudinaryService.uploadBuffer(file.buffer, undefined, 'plants'),
        );
        const uploadResults = await Promise.all(uploadPromises);

        imageDatas = uploadResults.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
        }));
        this.logger.log('Images uploaded successfully.');
      } catch (error) {
        this.logger.error(
          `Cloudinary upload failed: ${error.message}`,
          error.stack,
        );
        throw new HttpException(
          'Image upload failed.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return this.plantService.create(
      createPlantDto,
      imageDatas.length > 0 ? imageDatas : undefined,
    );
  }

  @Get()
  async findAll() {
    return this.plantService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.plantService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlantDto: UpdatePlantDto,
  ) {
    this.logger.log(`Received request to update plant ${id}`);
    return this.plantService.update(id, updatePlantDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Received request to delete plant ${id}`);
    return this.plantService.remove(id);
  }

  @Post('bulk')
  async bulkCreate(@Body() createPlantDtos: CreatePlantDto[]) {
    return this.plantService.bulkCreate(createPlantDtos);
  }
}
