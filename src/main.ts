import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { UserExceptionFilter } from './Auth/middleware/user.middleware';

async function mainApp() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));
  app.setGlobalPrefix('api/v1');

  // Enable CORS globally
  app.enableCors({
    origin: '*', // Adjust this to allow specific domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });


  // Apply the filter globally
  app.useGlobalFilters(new UserExceptionFilter());
  await app.listen(3000);
}

mainApp();