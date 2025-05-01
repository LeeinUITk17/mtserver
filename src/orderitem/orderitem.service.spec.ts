import { Test, TestingModule } from '@nestjs/testing';
import { OrderitemService } from './orderitem.service';

describe('OrderitemService', () => {
  let service: OrderitemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderitemService],
    }).compile();

    service = module.get<OrderitemService>(OrderitemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
