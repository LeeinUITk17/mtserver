import { Test, TestingModule } from '@nestjs/testing';
import { PostratingService } from './postrating.service';

describe('PostratingService', () => {
  let service: PostratingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostratingService],
    }).compile();

    service = module.get<PostratingService>(PostratingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
