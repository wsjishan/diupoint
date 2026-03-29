import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getHealth() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const timestamp = new Date().toISOString();

    // Basic health check - app is running
    const healthInfo: any = {
      status: 'ok',
      app: 'up',
      timestamp,
    };

    // Only check database if DATABASE_URL is configured
    if (!databaseUrl) {
      healthInfo.status = 'degraded';
      healthInfo.env = 'missing_database_url';
      healthInfo.database = 'unknown';
      healthInfo.message = 'DATABASE_URL is not configured';
      return healthInfo;
    }

    try {
      await prisma.$queryRaw`SELECT 1`;
      healthInfo.env = 'loaded';
      healthInfo.database = 'up';
      return healthInfo;
    } catch (error: any) {
      healthInfo.status = 'degraded';
      healthInfo.env = 'loaded';
      healthInfo.database = 'down';
      healthInfo.message = 'Database connectivity check failed';
      healthInfo.error = process.env.NODE_ENV === 'development' ? error.message : undefined;
      return healthInfo;
    }
  }
}
