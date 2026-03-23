import { PrismaClient } from '@prisma/client';

declare global {
  var __diupointPrisma__: PrismaClient | undefined;
}

export const prisma = globalThis.__diupointPrisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__diupointPrisma__ = prisma;
}

export { PrismaClient } from '@prisma/client';
