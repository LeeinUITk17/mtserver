import { Test, TestingModule } from '@nestjs/testing';
import { GalleryimageService } from './galleryimage.service';

describe('GalleryimageService', () => {
  let service: GalleryimageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GalleryimageService],
    }).compile();

    service = module.get<GalleryimageService>(GalleryimageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
