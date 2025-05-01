import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  app.use((req: Request, res: Response, next: NextFunction) => {
    next();
  });

  app.use(passport.initialize());

  const port = 8000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`Server is running on http://localhost:${port}`);
}

bootstrap();
