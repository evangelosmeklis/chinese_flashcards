import { PrismaClient } from '../generated/prisma';
import fs from 'fs';
import path from 'path';

// Calculate absolute path to the database
const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
const absoluteDbUrl = `file:${dbPath}`;

console.log('Using database at:', dbPath);

try {
  // Check if file exists and is writable
  if (fs.existsSync(dbPath)) {
    try {
      fs.accessSync(dbPath, fs.constants.W_OK);
      console.log('Database is writable');
    } catch (err) {
      console.warn('Database exists but is not writable, fixing permissions...');
      try {
        // Try to fix permissions
        fs.chmodSync(dbPath, 0o666); // rw-rw-rw-
        console.log('Database permissions fixed');
      } catch (chmodErr) {
        console.error('Failed to fix database permissions:', chmodErr);
      }
    }
  } else {
    console.warn('Database file does not exist at:', dbPath);
  }
} catch (err) {
  console.error('Error checking database file:', err);
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use more robust connection options
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || absoluteDbUrl
      }
    },
    errorFormat: 'pretty'
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db; 