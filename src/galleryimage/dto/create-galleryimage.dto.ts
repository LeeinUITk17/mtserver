import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGalleryImageDto {
  @IsNotEmpty()
  @IsString()
  galleryId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  imageUrl: string;
}
