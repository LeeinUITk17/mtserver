import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-orderitem.dto';
import { UpdateOrderItemDto } from './dto/update-orderitem.dto';

@Injectable()
export class OrderItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderItemDto: CreateOrderItemDto) {
    return this.prisma.orderItem.create({
      data: createOrderItemDto,
    });
  }

  async findAll() {
    return this.prisma.orderItem.findMany();
  }

  async findOne(id: string) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id },
    });
    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }
    return orderItem;
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id },
    });
    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }
    return this.prisma.orderItem.update({
      where: { id },
      data: updateOrderItemDto,
    });
  }

  async remove(id: string) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id },
    });
    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }
    return this.prisma.orderItem.delete({
      where: { id },
    });
  }
}
