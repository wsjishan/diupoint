import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { apiLoggingMiddleware } from './common/middleware/api-logging.middleware';
import { requestContextMiddleware } from './common/middleware/request-context.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(requestContextMiddleware);
  app.use(apiLoggingMiddleware);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = Number(
    process.env.PORT ?? configService.get<string>('PORT') ?? '4000'
  );

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((err) => {
  console.error('💥 Application failed to start:', err);
  process.exit(1);
});
