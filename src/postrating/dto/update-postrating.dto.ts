import { PartialType } from '@nestjs/mapped-types';
import { CreatePostRatingDto } from './create-postrating.dto';

export class UpdatePostRatingDto extends PartialType(CreatePostRatingDto) {}
