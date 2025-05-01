import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTestimonialDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  customerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerTitle?: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
