import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getHealth() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new ServiceUnavailableException('DATABASE_URL is not configured.');
    }

    try {
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        app: 'up',
        env: 'loaded',
        database: 'up',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        app: 'up',
        env: 'loaded',
        database: 'down',
        message: 'Database connectivity check failed.',
      });
    }
  }
}
