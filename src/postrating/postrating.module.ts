import { Module } from '@nestjs/common';
import { PostRatingService } from './postrating.service';
import { PostRatingController } from './postrating.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostRatingController],
  providers: [PostRatingService],
})
export class PostratingModule {}
