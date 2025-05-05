import { Module } from '@nestjs/common';
import { GalleryImageService } from './galleryimage.service';
import { GalleryImageController } from './galleryimage.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { GalleryModule } from '../gallery/gallery.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, GalleryModule],
  controllers: [GalleryImageController],
  providers: [GalleryImageService],
})
export class GalleryimageModule {}
