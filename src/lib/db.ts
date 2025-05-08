import { PrismaClient } from '../generated/prisma';
import fs from 'fs';
import path from 'path';

// Calculate absolute path to the database
const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
const absoluteDbUrl = `file:${dbPath}`;

console.log('Using database at:', dbPath);

// Check and fix database if needed
function checkAndFixDatabase() {
  try {
    // Check if file exists and is not empty
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      
      if (stats.size === 0) {
        console.warn('Database file exists but is empty (0 bytes). Attempting to restore from backup...');
        
        // Find the latest backup
        const backupDir = path.dirname(dbPath);
        const backupFiles = fs.readdirSync(backupDir)
          .filter(file => file.startsWith('dev.db.backup_'))
          .sort()
          .reverse();
        
        if (backupFiles.length > 0) {
          const latestBackup = path.join(backupDir, backupFiles[0]);
          console.log(`Restoring database from backup: ${latestBackup}`);
          
          // Create a new backup of the current empty file (just in case)
          const timestamp = new Date().toISOString().replace(/[:.]/g, '');
          const emptyBackupPath = `${dbPath}.empty_${timestamp}`;
          fs.copyFileSync(dbPath, emptyBackupPath);
          
          // Copy the backup to the main database file
          fs.copyFileSync(latestBackup, dbPath);
          console.log('Database successfully restored from backup');
        } else {
          console.error('No database backups found. Unable to restore.');
        }
      }
      
      // Check if file is writable
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
}

// Run the database check and fix
checkAndFixDatabase();

// Create a backup of the database on startup
function backupDatabase() {
  try {
    if (fs.existsSync(dbPath) && fs.statSync(dbPath).size > 0) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '') + '_' + 
                      new Date().toTimeString().slice(0, 8).replace(/:/g, '');
      const backupPath = `${dbPath}.backup_${timestamp}`;
      
      fs.copyFileSync(dbPath, backupPath);
      console.log(`Created database backup at: ${backupPath}`);
      
      // Keep only the last 5 backups
      const backupDir = path.dirname(dbPath);
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('dev.db.backup_'))
        .sort();
      
      if (backupFiles.length > 5) {
        // Remove oldest backups
        for (let i = 0; i < backupFiles.length - 5; i++) {
          const oldBackup = path.join(backupDir, backupFiles[i]);
          fs.unlinkSync(oldBackup);
          console.log(`Removed old backup: ${oldBackup}`);
        }
      }
    }
  } catch (err) {
    console.error('Error backing up database:', err);
  }
}

// Create a backup on startup
backupDatabase();

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