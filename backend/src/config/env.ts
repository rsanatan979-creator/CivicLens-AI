import dotenv from 'dotenv';
dotenv.config();

// Dynamically construct DATABASE_URL if missing but individual properties are present
if (!process.env.DATABASE_URL && process.env.SQL_HOST && process.env.SQL_USER) {
  const host = process.env.SQL_HOST;
  const user = process.env.SQL_USER;
  const password = process.env.SQL_PASSWORD || '';
  const database = process.env.SQL_DB_NAME || 'civic_agent';
  process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:5432/${database}`;
}

let JWT_SECRET = process.env.JWT_SECRET;

// Fail application startup if JWT_SECRET is missing, unless running in test mode
if (!JWT_SECRET) {
  const isTesting = process.env.NODE_ENV === 'test' || 
                    process.argv.some(arg => arg.includes('--test') || arg.includes('test'));
  const isDev = process.env.NODE_ENV !== 'production';
  if (isTesting || isDev) {
    JWT_SECRET = 'development-environment-jwt-secret-placeholder-key-12345';
  } else {
    console.error('\n❌ FATAL: JWT_SECRET environment variable is missing.');
    console.error('Application startup aborted. Configure JWT_SECRET in environment or .env file.\n');
    process.exit(1);
  }
}

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const config = {
  JWT_SECRET: JWT_SECRET as string,
  ALLOWED_ORIGINS,
  AI_SERVICE_URL,
};

export default config;
