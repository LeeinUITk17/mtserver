import { Test, TestingModule } from '@nestjs/testing';
import { PostratingController } from './postrating.controller';
import { PostratingService } from './postrating.service';

describe('PostratingController', () => {
  let controller: PostratingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostratingController],
      providers: [PostratingService],
    }).compile();

    controller = module.get<PostratingController>(PostratingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
