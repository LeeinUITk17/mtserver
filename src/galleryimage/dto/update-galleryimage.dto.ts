import { PartialType } from '@nestjs/mapped-types';
import { CreateGalleryImageDto } from './create-galleryimage.dto';

export class UpdateGalleryImageDto extends PartialType(CreateGalleryImageDto) {}
