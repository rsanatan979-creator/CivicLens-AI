import { prisma } from '../config/prisma.ts';
import { winstonLogger } from '../utils/logger.ts';

export class LogRepository {
  static async getAll() {
    const start = process.hrtime();
    try {
      const results = await prisma.systemLog.findMany({
        orderBy: {
          timestamp: 'desc',
        },
      });

      // If empty, return initial seed logs
      if (results.length === 0) {
        const seedLogs = [
          { id: 'l-1', text: '[SYS] Unified Express Engine bootstrapped on port 3000', type: 'SYS', timestamp: '11:52:12' },
          { id: 'l-2', text: '[AI] Loaded Gemini-3.5-flash vision diagnostic adapter', type: 'AI', timestamp: '11:52:25' },
          { id: 'l-3', text: '[DB] Connected to secure relational storage abstraction', type: 'DB', timestamp: '11:52:30' },
        ];
        
        const created = [];
        for (const log of seedLogs) {
          const item = await prisma.systemLog.create({ data: log });
          created.push(item);
        }
        
        const diff = process.hrtime(start);
        winstonLogger.debug(`[DB TIMING] getAll (seeded) systemLogs took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
        return created;
      }

      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] getAll systemLogs took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return results;
    } catch (error) {
      winstonLogger.error('Error in getAll logs:', error);
      throw new Error('Database error retrieving system logs', { cause: error });
    }
  }

  static async log(text: string, type: 'SYS' | 'AI' | 'DB' | 'WARN') {
    const start = process.hrtime();
    const timestamp = new Date().toLocaleTimeString();
    try {
      const newLog = await prisma.systemLog.create({
        data: {
          id: `l-${Date.now()}`,
          text,
          type,
          timestamp,
        },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] log took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return newLog;
    } catch (error) {
      winstonLogger.error('Error logging to database:', error);
      // Fallback: Don't crash because logs failed
      return { id: `l-${Date.now()}`, text, type, timestamp };
    }
  }
}
