import app from '../backend/src/app.ts';
import { runMigrations } from '../backend/src/db/migrate.ts';
import { seedDatabase } from '../backend/src/config/seed.ts';

let initialized = false;

async function initialize() {
  if (!initialized) {
    try {
      await runMigrations();
      await seedDatabase();
    } catch (e) {
      console.error('Initialization error during serverless startup:', e);
    }
    initialized = true;
  }
}

export default async function handler(req: any, res: any) {
  await initialize();
  return app(req, res);
}
