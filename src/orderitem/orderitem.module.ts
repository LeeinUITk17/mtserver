import { Module } from '@nestjs/common';
import { OrderItemService } from './orderitem.service';
import { OrderItemController } from './orderitem.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrderItemController],
  providers: [OrderItemService],
})
export class OrderitemModule {}
