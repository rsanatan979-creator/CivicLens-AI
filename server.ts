import app from './backend/src/app.ts';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { runMigrations } from './backend/src/db/migrate.ts';
import { seedDatabase } from './backend/src/config/seed.ts';

const PORT = 3000;

async function bootstrap() {
  // 1. Run database migrations first
  await runMigrations();

  // 2. Run database initialization and seeding on startup
  await seedDatabase();

  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Starting Unified Development Server with Vite Middleware...');
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('🚀 Serving Production-Compiled Static Assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 CivicAgent Unified Server boot completed successfully.`);
    console.log(`📍 Endpoint Gateway: http://localhost:${PORT}/api/v1`);
    console.log(`📍 Live Preview URL: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

import express from 'express';
bootstrap().catch((err) => {
  console.error('Fatal Server Bootstrap Failure:', err);
  process.exit(1);
});
