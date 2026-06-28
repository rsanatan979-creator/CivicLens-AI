import { prisma } from '../config/prisma.ts';
import { ComplaintStatus, Severity } from '../types/enums.ts';
import { winstonLogger } from '../utils/logger.ts';

export interface CreateComplaintDTO {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedDept: string;
  reportedBy: string;
  reportedById: string;
  reportedAt: string;
  imageUrl: string;
  locationName: string;
  latitude: number;
  longitude: number;
  aiConfidence: number;
}

export class ComplaintRepository {
  static async getAll() {
    const start = process.hrtime();
    try {
      const allComplaints = await prisma.complaint.findMany({
        include: {
          timeline: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] getAll complaints took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return allComplaints;
    } catch (error) {
      winstonLogger.error('Error in getAll complaints:', error);
      throw new Error('Database error retrieving complaints', { cause: error });
    }
  }

  static async findById(id: string) {
    const start = process.hrtime();
    try {
      const complaint = await prisma.complaint.findUnique({
        where: { id },
        include: {
          timeline: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] findById complaint took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return complaint;
    } catch (error) {
      winstonLogger.error(`Error in findById for complaint ID ${id}:`, error);
      throw new Error('Database error retrieving complaint details', { cause: error });
    }
  }

  static async create(dto: CreateComplaintDTO) {
    const start = process.hrtime();
    try {
      const complaint = await prisma.complaint.create({
        data: {
          id: dto.id,
          title: dto.title,
          description: dto.description,
          category: dto.category,
          severity: dto.severity as Severity,
          status: 'PENDING' as ComplaintStatus,
          assignedDept: dto.assignedDept,
          reportedBy: dto.reportedBy,
          citizenId: dto.reportedById,
          imageUrl: dto.imageUrl,
          locationName: dto.locationName,
          latitude: dto.latitude,
          longitude: dto.longitude,
          aiConfidence: dto.aiConfidence,
        },
      });

      const initialTimeline = await prisma.timelineItem.create({
        data: {
          id: `t-${Date.now()}`,
          complaintId: dto.id,
          status: 'Report Submitted',
          description: 'Initial report successfully compiled and logged in database registry.',
          timestamp: 'Just now',
          isCurrent: true,
        },
      });

      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] create complaint took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      
      return {
        ...complaint,
        timeline: [initialTimeline],
      };
    } catch (error) {
      winstonLogger.error('Error creating complaint:', error);
      throw new Error('Database error creating complaint ticket', { cause: error });
    }
  }

  static async updateStatus(id: string, status: string, timelineDescription: string, timestampStr: string) {
    const start = process.hrtime();
    try {
      // Set all other timeline items for this complaint to isCurrent = false
      await prisma.timelineItem.updateMany({
        where: { complaintId: id },
        data: { isCurrent: false },
      });

      // Update complaint status
      const updatedComplaint = await prisma.complaint.update({
        where: { id },
        data: { status: status as ComplaintStatus },
      });

      // Add new timeline item
      await prisma.timelineItem.create({
        data: {
          id: `t-update-${Date.now()}`,
          complaintId: id,
          status: status === 'RESOLVED' ? 'Resolved' : status === 'IN_PROGRESS' ? 'In Progress' : 'Dispatch Update',
          description: timelineDescription,
          timestamp: timestampStr,
          isCurrent: true,
        },
      });

      const timeline = await prisma.timelineItem.findMany({
        where: { complaintId: id },
        orderBy: { timestamp: 'desc' },
      });

      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] updateStatus complaint took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);

      return {
        ...updatedComplaint,
        timeline,
      };
    } catch (error) {
      winstonLogger.error(`Error updating status for complaint ID ${id}:`, error);
      throw new Error('Database error updating complaint status', { cause: error });
    }
  }

  static async updateSeverityAndDept(id: string, severity?: string, assignedDept?: string) {
    const start = process.hrtime();
    try {
      const updates: any = {};
      if (severity) updates.severity = severity as Severity;
      if (assignedDept) updates.assignedDept = assignedDept;

      const updatedComplaint = await prisma.complaint.update({
        where: { id },
        data: updates,
      });

      const timeline = await prisma.timelineItem.findMany({
        where: { complaintId: id },
        orderBy: { timestamp: 'desc' },
      });

      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] updateSeverityAndDept complaint took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);

      return {
        ...updatedComplaint,
        timeline,
      };
    } catch (error) {
      winstonLogger.error(`Error updating severity/dept for complaint ID ${id}:`, error);
      throw new Error('Database error updating complaint configuration', { cause: error });
    }
  }

  static async incrementUpvotes(id: string) {
    const start = process.hrtime();
    try {
      const updated = await prisma.complaint.update({
        where: { id },
        data: {
          upvotes: {
            increment: 1,
          },
        },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] incrementUpvotes complaint took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return updated;
    } catch (error) {
      winstonLogger.error(`Error incrementing upvotes for complaint ID ${id}:`, error);
      throw new Error('Database error incrementing upvotes', { cause: error });
    }
  }

  static async delete(id: string) {
    const start = process.hrtime();
    try {
      const deleted = await prisma.complaint.delete({
        where: { id },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] delete complaint took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return deleted;
    } catch (error) {
      winstonLogger.error(`Error deleting complaint ID ${id}:`, error);
      throw new Error('Database error deleting complaint ticket', { cause: error });
    }
  }
}
