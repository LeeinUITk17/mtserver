import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Post()
  async create(@Body() createPlantDto: CreatePlantDto) {
    return this.plantService.create(createPlantDto);
  }

  @Get()
  async findAll() {
    return this.plantService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.plantService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlantDto: UpdatePlantDto,
  ) {
    return this.plantService.update(id, updatePlantDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.plantService.remove(id);
  }
}
