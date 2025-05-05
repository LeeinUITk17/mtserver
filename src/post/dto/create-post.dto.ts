import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RateLevel } from '@prisma/client';
export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(RateLevel)
  rating?: RateLevel = RateLevel.low;
}
