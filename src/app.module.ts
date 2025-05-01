import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CategoryModule } from './category/category.module';
import { PlantModule } from './plant/plant.module';
import { PostModule } from './post/post.module';
import { PostratingModule } from './postrating/postrating.module';
import { ImageModule } from './image/image.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { OrderModule } from './order/order.module';
import { OrderitemModule } from './orderitem/orderitem.module';
import { GalleryModule } from './gallery/gallery.module';
import { GalleryimageModule } from './galleryimage/galleryimage.module';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule, CategoryModule, PlantModule, PostModule, PostratingModule, ImageModule, TestimonialModule, OrderModule, OrderitemModule, GalleryModule, GalleryimageModule],
  providers: [AppService],
})
export class AppModule {}
