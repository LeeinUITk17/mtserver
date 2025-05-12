import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Prisma, RateLevel } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async generateUniqueSlug(
    title: string,
    retryCount = 0,
  ): Promise<string> {
    let baseSlug = slugify(title, {
      lower: true,
      strict: true,
      replacement: '-',
    });
    if (retryCount > 0) {
      baseSlug = `${baseSlug}-${retryCount}`;
    }

    const existingPost = await this.prisma.post.findUnique({
      where: { slug: baseSlug },
    });

    if (existingPost) {
      this.logger.warn(
        `Slug "${baseSlug}" already exists. Generating a new one.`,
      );
      return this.generateUniqueSlug(title, retryCount + 1); // Recurse with incremented count
    }
    return baseSlug;
  }

  async create(
    createPostDto: CreatePostDto,
    imageDatas?: Prisma.ImageCreateManyInput[],
  ) {
    this.logger.log(`Creating post: ${createPostDto.title}`);
    try {
      await this.prisma.user.findUniqueOrThrow({
        where: { id: createPostDto.userId },
      });
    } catch (error) {
      this.logger.error(`User with ID ${createPostDto.userId} not found.`);
      throw new BadRequestException(`Invalid user ID provided.`);
    }
    const slug = await this.generateUniqueSlug(createPostDto.title);
    this.logger.log(
      `Generated slug: ${slug} for title: "${createPostDto.title}"`,
    );
    try {
      const createdPost = await this.prisma.post.create({
        data: {
          ...createPostDto,
          slug: slug,
          images: imageDatas
            ? {
                createMany: {
                  data: imageDatas,
                  skipDuplicates: true,
                },
              }
            : undefined,
        },
        include: {
          images: true,
          user: { select: { id: true, username: true, email: true } },
        },
      });
      this.logger.log(`Post created successfully with ID: ${createdPost.id}`);
      return createdPost;
    } catch (error) {
      this.logger.error(`Failed to create post: ${error.message}`, error.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Post title might already exist.');
        }
      }
      throw error;
    }
  }

  async findAll(limit?: number, rating?: RateLevel) {
    this.logger.log(
      `Finding all posts${limit ? ` (limit: ${limit})` : ''}${
        rating ? ` (rating: ${rating})` : ''
      }`,
    );
    const whereCondition: Prisma.PostWhereInput = {};
    if (rating) {
      whereCondition.rating = rating;
    }

    return this.prisma.post.findMany({
      take: limit,
      where: whereCondition,
      include: {
        images: true,
        user: { select: { id: true, username: true, email: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    this.logger.log(`Finding post with ID: ${id}`);
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        images: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });
    if (!post) {
      this.logger.warn(`Post with ID ${id} not found`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }
  async findBySlug(slug: string) {
    this.logger.log(`Finding post with slug: ${slug}`);
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        images: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });
    if (!post) {
      this.logger.warn(`Post with slug ${slug} not found`);
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    this.logger.log(`Updating post with ID: ${id}`);
    const existingPost = await this.findOne(id);
    const dataToUpdate: Prisma.PostUpdateInput = { ...updatePostDto };
    if (updatePostDto.title && updatePostDto.title !== existingPost.title) {
      this.logger.log(`Title changed for post ${id}. Regenerating slug.`);
      dataToUpdate.slug = await this.generateUniqueSlug(updatePostDto.title);
      this.logger.log(`New slug for post ${id}: ${dataToUpdate.slug}`);
    }

    try {
      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: dataToUpdate,
        include: {
          images: true,
          user: { select: { id: true, username: true, email: true } },
        },
      });
      this.logger.log(`Post ${id} updated successfully.`);
      return updatedPost;
    } catch (error) {
      this.logger.error(
        `Failed to update post ${id}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Update failed: Post title might already exist.',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.log(`Attempting to remove post with ID: ${id}`);
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!post) {
      this.logger.warn(`Post with ID ${id} not found for deletion.`);
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.images && post.images.length > 0) {
      this.logger.log(
        `Deleting ${post.images.length} associated images from Cloudinary for post ${id}.`,
      );
      const deletePromises = post.images
        .filter((img) => img.publicId)
        .map((img) =>
          this.cloudinaryService
            .deleteFile(img.publicId)
            .catch((err) =>
              this.logger.error(
                `Failed to delete Cloudinary file ${img.publicId}: ${err.message}`,
                err.stack,
              ),
            ),
        );
      await Promise.all(deletePromises);
    } else {
      this.logger.log(
        `No associated images with publicIds found for post ${id}.`,
      );
    }

    try {
      this.logger.log(`Deleting post record ${id} from database.`);
      const deletedPost = await this.prisma.post.delete({ where: { id } });
      this.logger.log(`Successfully deleted post ${id}.`);
      return deletedPost;
    } catch (error) {
      this.logger.error(
        `Failed to delete post ${id} from database: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        this.logger.error(
          `Cannot delete post ${id} due to foreign key constraints.`,
        );
        throw new BadRequestException(
          `Cannot delete post. Related records might exist.`,
        );
      }
      throw error;
    }
  }
}
