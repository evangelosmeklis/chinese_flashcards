import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Check if the database file exists and has write permissions
const dbPath = path.resolve(__dirname, './dev.db');
let dbExists = false;
let dbIsWritable = false;

try {
  dbExists = fs.existsSync(dbPath);
  if (dbExists) {
    // Check if the file is writable
    try {
      fs.accessSync(dbPath, fs.constants.W_OK);
      dbIsWritable = true;
    } catch (err) {
      console.warn('Database file exists but is not writable:', err);
      // Try to make it writable
      try {
        fs.chmodSync(dbPath, 0o666); // rw-rw-rw-
        console.log('Fixed database permissions');
        dbIsWritable = true;
      } catch (chmodErr) {
        console.error('Failed to fix database permissions:', chmodErr);
      }
    }
  }
} catch (err) {
  console.error('Error checking database file:', err);
}

// Log the database status
console.log(`Database status: exists=${dbExists}, writable=${dbIsWritable}`);

// Export the Prisma client
const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma; 