import { PrismaClient } from '@prisma/client';
import { join } from 'path';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const defaultDbUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL
    : process.env.DATABASE_URL ?? `file:${join(process.cwd(), 'prisma', 'dev.db')}`;

if (!defaultDbUrl) {
  throw new Error('DATABASE_URL is not set.');
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: defaultDbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
