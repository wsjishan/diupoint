import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
