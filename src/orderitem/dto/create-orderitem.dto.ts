import { IsNotEmpty, IsString, IsInt, IsDecimal } from 'class-validator';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  plantId: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsNotEmpty()
  @IsDecimal()
  price: number;
}
