import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GalleryImageService } from './galleryimage.service';
import { CreateGalleryImageDto } from './dto/create-galleryimage.dto';
import { UpdateGalleryImageDto } from './dto/update-galleryimage.dto';

@Controller('gallery-images')
export class GalleryImageController {
  constructor(private readonly galleryImageService: GalleryImageService) {}

  @Post()
  async create(@Body() createGalleryImageDto: CreateGalleryImageDto) {
    return this.galleryImageService.create(createGalleryImageDto);
  }

  @Get()
  async findAll() {
    return this.galleryImageService.findAll();
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
    return this.galleryImageService.update(id, updateGalleryImageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.galleryImageService.remove(id);
  }
}
