import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateImageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  url: string;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsString()
  publicId?: string;

  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  testimonialId?: string;
}
