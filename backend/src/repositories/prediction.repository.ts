import { prisma } from '../config/prisma.ts';
import { winstonLogger } from '../utils/logger.ts';

export class PredictionRepository {
  static async getAll() {
    const start = process.hrtime();
    try {
      const results = await prisma.prediction.findMany();

      // If empty, seed initial predictions
      if (results.length === 0) {
        const seedData = [
          { id: 'p-1', areaName: 'Sector 4 (Downtown Grid)', riskScore: 88.5, predictedIssue: 'Pothole density build-up' },
          { id: 'p-2', areaName: 'Sector 12 (Waterfront Area)', riskScore: 74.2, predictedIssue: 'Drainage blocks & flood risk' },
          { id: 'p-3', areaName: 'Sector 7 (Eastside Crossing)', riskScore: 61.8, predictedIssue: 'Streetlight outages' },
        ];
        
        const created = [];
        for (const pred of seedData) {
          const item = await prisma.prediction.create({ data: pred });
          created.push(item);
        }
        
        const diff = process.hrtime(start);
        winstonLogger.debug(`[DB TIMING] getAll (seeded) predictions took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
        return created;
      }

      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] getAll predictions took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return results;
    } catch (error) {
      winstonLogger.error('Error fetching predictions:', error);
      throw new Error('Database error retrieving predictive hotspots', { cause: error });
    }
  }
}
