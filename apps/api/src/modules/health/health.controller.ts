import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getHealth() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const timestamp = new Date().toISOString();

    if (!databaseUrl) {
      return {
        status: 'degraded',
        app: 'up',
        env: 'missing_database_url',
        database: 'unknown',
        message: 'DATABASE_URL is not configured.',
        timestamp,
      };
    }

    try {
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        app: 'up',
        env: 'loaded',
        database: 'up',
        timestamp,
      };
    } catch {
      return {
        status: 'degraded',
        app: 'up',
        env: 'loaded',
        database: 'down',
        message: 'Database connectivity check failed.',
        timestamp,
      };
    }
  }
}
