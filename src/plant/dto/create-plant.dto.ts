import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDecimal,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreatePlantDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDecimal()
  price: number;

  @IsNotEmpty()
  @IsInt()
  stock: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;
}
