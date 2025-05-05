import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateGalleryImageDto {
  @IsNotEmpty()
  @IsString()
  galleryId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  publicId: string;
}
