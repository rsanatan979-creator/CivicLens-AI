import { Request, Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { ComplaintRepository } from '../repositories/complaint.repository.ts';
import { UserRepository } from '../repositories/user.repository.ts';
import { LogRepository } from '../repositories/log.repository.ts';
import { CreateComplaintSchema, UpdateComplaintSchema } from '../validators/complaint.validator.ts';
import { winstonLogger } from '../utils/logger.ts';

export class ComplaintController {
  static async list(req: Request, res: Response) {
    try {
      const results = await ComplaintRepository.getAll();
      res.json({ success: true, data: results });
    } catch (error: any) {
      winstonLogger.error('Error listing complaints:', error);
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const complaint = await ComplaintRepository.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          errorCode: 'COMPLAINT_NOT_FOUND',
          message: 'Complaint ticket not found',
        });
      }
      res.json({ success: true, data: complaint });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, errorCode: 'UNAUTHORIZED', message: 'Auth required' });
      }

      // Zod validation
      const parseResult = CreateComplaintSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0].message,
        });
      }

      const validated = parseResult.data;
      const newId = `REQ-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const now = new Date();
      const timestampStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ` at ` + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const newComplaint = await ComplaintRepository.create({
        id: newId,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        severity: validated.severity,
        assignedDept: validated.assignedDept,
        reportedBy: user.name,
        reportedById: user.uid,
        reportedAt: timestampStr,
        imageUrl: validated.imageUrl,
        locationName: validated.locationName,
        latitude: validated.latitude,
        longitude: validated.longitude,
        aiConfidence: validated.aiConfidence,
      });

      // Award points for filing a report
      await UserRepository.updatePoints(user.uid, 50);

      await LogRepository.log(`[DB] Inserted complaint ${newComplaint.id} to registry. Assigned: ${newComplaint.assignedDept}`, 'DB');

      res.status(201).json({ success: true, data: newComplaint });
    } catch (error: any) {
      winstonLogger.error('Error creating complaint controller:', error);
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, errorCode: 'UNAUTHORIZED', message: 'Auth required' });
      }

      // Zod validation
      const parseResult = UpdateComplaintSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0].message,
        });
      }

      const { status, severity, assignedDept } = parseResult.data;
      const complaint = await ComplaintRepository.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ success: false, errorCode: 'COMPLAINT_NOT_FOUND', message: 'Complaint not found' });
      }

      let updatedComplaint = complaint;

      if (status && status !== complaint.status) {
        const now = new Date();
        const timestampStr = `Today, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        
        let timelineDesc = `Municipal dispatch updated status to ${status}.`;
        if (status === 'RESOLVED') {
          timelineDesc = `Issue officially resolved. Clean-up/patrol team operations verified by supervisor.`;
        } else if (status === 'IN_PROGRESS') {
          timelineDesc = `Field team dispatched. Operations commenced.`;
        }

        updatedComplaint = await ComplaintRepository.updateStatus(complaint.id, status, timelineDesc, timestampStr);
        await LogRepository.log(`[SYS] Complaint ${complaint.id} status updated to ${status} by ${user.name}`, 'SYS');
      }

      if (severity || assignedDept) {
        updatedComplaint = await ComplaintRepository.updateSeverityAndDept(complaint.id, severity, assignedDept);
      }

      res.json({ success: true, data: updatedComplaint });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, errorCode: 'UNAUTHORIZED', message: 'Auth required' });
      }

      const deleted = await ComplaintRepository.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, errorCode: 'COMPLAINT_NOT_FOUND', message: 'Complaint not found' });
      }

      await LogRepository.log(`[SYS] Complaint ticket ${req.params.id} deleted by ${user.name}`, 'SYS');
      res.json({ success: true, message: 'Ticket deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }
}
export default ComplaintController;
