import { Module } from '@nestjs/common';
import { GalleryImageService } from './galleryimage.service';
import { GalleryImageController } from './galleryimage.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GalleryImageController],
  providers: [GalleryImageService],
})
export class GalleryimageModule {}
