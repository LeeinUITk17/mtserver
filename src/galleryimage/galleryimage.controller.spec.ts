import { Test, TestingModule } from '@nestjs/testing';
import { GalleryimageController } from './galleryimage.controller';
import { GalleryimageService } from './galleryimage.service';

describe('GalleryimageController', () => {
  let controller: GalleryimageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GalleryimageController],
      providers: [GalleryimageService],
    }).compile();

    controller = module.get<GalleryimageController>(GalleryimageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
