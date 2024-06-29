import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './shared/filters/all.exceptions.filter';

async function bootstrap() {
  // App config
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger config
  const config = new DocumentBuilder().setTitle('SQUIRE').setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Launching the application
  await app.listen(process.env.PORT);

  const appUrl = await app.getUrl();
  Logger.verbose(`🚀 Application is on: ${appUrl}`);
  Logger.verbose(`🛸 Swagger is on: ${appUrl}/api`);
}
bootstrap();
