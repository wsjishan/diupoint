import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

if (!process.env.DATABASE_URL && process.env.PROD_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.PROD_DATABASE_URL;
}

async function bootstrap() {
  // Validate critical environment variables before starting
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);

  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('⚠️  Please configure these in Azure App Service Configuration');
    console.error('   or set them before starting the application.');
    // Don't exit here - let the app start and let health check handle degradation
  }

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
}

bootstrap();
