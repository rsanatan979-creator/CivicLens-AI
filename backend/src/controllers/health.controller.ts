import { Request, Response } from 'express';
import { prisma } from '../config/prisma.ts';
import axios from 'axios';
import { config } from '../config/env.ts';
import { winstonLogger } from '../utils/logger.ts';

export class HealthController {
  static async general(req: Request, res: Response) {
    res.json({
      success: true,
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  static async dbCheck(req: Request, res: Response) {
    const start = process.hrtime();
    try {
      // Execute a raw query via Prisma Client to check PostgreSQL health
      await prisma.$queryRaw`SELECT 1`;
      
      const diff = process.hrtime(start);
      const latency = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      
      res.json({
        success: true,
        status: 'OK',
        database: 'Connected',
        latencyMs: parseFloat(latency),
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      winstonLogger.error('Database health check failed:', error);
      res.status(503).json({
        success: false,
        status: 'ERROR',
        message: 'Database connection failed',
        error: error.message,
      });
    }
  }

  static async aiCheck(req: Request, res: Response) {
    const hasGemini = !!process.env.GEMINI_API_KEY;
    let pythonServiceStatus = 'Unavailable';
    let pythonLatency = 0;
    
    const start = process.hrtime();
    try {
      const response = await axios.get(`${config.AI_SERVICE_URL}/health`, { timeout: 1500 });
      if (response.status === 200) {
        pythonServiceStatus = 'Connected';
        const diff = process.hrtime(start);
        pythonLatency = parseFloat((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
      }
    } catch {
      // expected fallback state if FastAPI container is offline locally
    }

    const overallStatus = hasGemini || pythonServiceStatus === 'Connected' ? 'OK' : 'DEGRADED';

    res.json({
      success: true,
      status: overallStatus,
      details: {
        geminiConfigured: hasGemini,
        pythonService: pythonServiceStatus,
        pythonServiceLatencyMs: pythonLatency > 0 ? pythonLatency : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
export default HealthController;
