import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Controller('galleries')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  async create(@Body() createGalleryDto: CreateGalleryDto) {
    return this.galleryService.create(createGalleryDto);
  }

  @Get()
  async findAll() {
    return this.galleryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGalleryDto: UpdateGalleryDto,
  ) {
    return this.galleryService.update(id, updateGalleryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
