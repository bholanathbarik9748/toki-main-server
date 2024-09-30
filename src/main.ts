import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { UserExceptionFilter } from './Auth/middleware/user.middleware';

async function mainApp() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));
  app.setGlobalPrefix('api/v1');

  // Apply the filter globally
  app.useGlobalFilters(new UserExceptionFilter());
  await app.listen(3000);
}

mainApp();