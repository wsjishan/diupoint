import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig, env } from 'prisma/config';

dotenv.config({
  path: resolve(process.cwd(), 'packages/db/.env'),
  quiet: true,
});

export default defineConfig({
  schema: resolve(process.cwd(), 'packages/db/prisma/schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
});
