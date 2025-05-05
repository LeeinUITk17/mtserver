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
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
  Logger,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Prisma, RateLevel } from '@prisma/client';

@Controller('posts')
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    this.logger.log(
      `Received request to create post: ${createPostDto.title} with ${files?.length || 0} images.`,
    );
    let imageDatas: Prisma.ImageCreateManyInput[] = [];

    if (files && files.length > 0) {
      this.logger.log(`Uploading ${files.length} images to Cloudinary...`);
      try {
        const uploadPromises = files.map((file) =>
          this.cloudinaryService.uploadBuffer(file.buffer, undefined, 'posts'),
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

    return this.postService.create(
      createPostDto,
      imageDatas.length > 0 ? imageDatas : undefined,
    );
  }

  @Get()
  async findAll(
    @Query(
      'limit',
      new DefaultValuePipe(undefined),
      new ParseIntPipe({ optional: true }),
    )
    limit?: number,
    @Query('rating', new ParseEnumPipe(RateLevel, { optional: true }))
    rating?: RateLevel,
  ) {
    const safeLimit = limit && limit > 0 && limit <= 50 ? limit : undefined;
    return this.postService.findAll(safeLimit, rating);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    this.logger.log(`Received request to update post ${id}`);
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Received request to delete post ${id}`);
    return this.postService.remove(id);
  }
}
