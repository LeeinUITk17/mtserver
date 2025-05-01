import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CreatePostRatingDto {
  @IsNotEmpty()
  @IsString()
  postId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
