import { Request, Response } from 'express';
import { prisma } from '../config/prisma.ts';

export class AnalyticsController {
  static async getCategories(req: Request, res: Response) {
    try {
      const counts = await prisma.complaint.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
      });
      const data = counts.map(item => ({
        name: item.category,
        value: item._count.id,
      }));
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }

  static async getAreas(req: Request, res: Response) {
    try {
      const counts = await prisma.complaint.groupBy({
        by: ['locationName'],
        _count: {
          id: true,
        },
      });
      const data = counts.map(item => ({
        name: item.locationName,
        value: item._count.id,
      }));
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }

  static async getSeverity(req: Request, res: Response) {
    try {
      const counts = await prisma.complaint.groupBy({
        by: ['severity'],
        _count: {
          id: true,
        },
      });
      const data = counts.map(item => ({
        name: item.severity,
        value: item._count.id,
      }));
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }

  static async getResolution(req: Request, res: Response) {
    try {
      const resolvedCount = await prisma.complaint.count({ where: { status: 'RESOLVED' } });
      const totalCount = await prisma.complaint.count();
      const rate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
      res.json({ success: true, data: { resolvedCount, totalCount, rate } });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }
}
export default AnalyticsController;
