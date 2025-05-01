import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostRatingService } from './postrating.service';
import { CreatePostRatingDto } from './dto/create-postrating.dto';
import { UpdatePostRatingDto } from './dto/update-postrating.dto';

@Controller('postratings')
export class PostRatingController {
  constructor(private readonly postRatingService: PostRatingService) {}

  @Post()
  async create(@Body() createPostRatingDto: CreatePostRatingDto) {
    return this.postRatingService.create(createPostRatingDto);
  }

  @Get()
  async findAll() {
    return this.postRatingService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postRatingService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostRatingDto: UpdatePostRatingDto,
  ) {
    return this.postRatingService.update(id, updatePostRatingDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.postRatingService.remove(id);
  }
}
