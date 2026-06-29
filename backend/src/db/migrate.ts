import { execSync } from 'child_process';
import { winstonLogger } from '../utils/logger.ts';

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    winstonLogger.warn('⚠️ Skipping database schema sync: DATABASE_URL is not set.');
    return;
  }

  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const command = isProduction 
      ? 'npx prisma migrate deploy --schema=backend/prisma/schema.prisma'
      : 'npx prisma db push --schema=backend/prisma/schema.prisma --accept-data-loss';

    winstonLogger.info(`🔄 Synchronizing database tables with Prisma schema using: ${command}...`);
    
    const output = execSync(command, {
      env: { ...process.env },
      encoding: 'utf-8',
    });
    
    winstonLogger.info('✅ Database synchronization completed.');
    winstonLogger.debug(output);
  } catch (error: any) {
    winstonLogger.error('❌ Failed to synchronize database schema:', error);
    // Allow boot to continue even if database is not active
    winstonLogger.warn('⚠️ Server continuing boot. Start PostgreSQL or update the DATABASE_URL in your .env file to enable database operations.');
  }
}
