import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGalleryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
