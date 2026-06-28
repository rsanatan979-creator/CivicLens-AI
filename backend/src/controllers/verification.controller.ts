import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { VerificationRepository } from '../repositories/verification.repository.ts';
import { ComplaintRepository } from '../repositories/complaint.repository.ts';
import { UserRepository } from '../repositories/user.repository.ts';
import { LogRepository } from '../repositories/log.repository.ts';
import { CastVoteSchema } from '../validators/verification.validator.ts';

export class VerificationController {
  static async cast(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, errorCode: 'UNAUTHORIZED', message: 'Authentication required' });
      }

      // Zod Validation
      const parseResult = CastVoteSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0].message,
        });
      }

      const { complaintId, voteType } = parseResult.data;

      // Verify complaint exists
      const complaint = await ComplaintRepository.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          errorCode: 'COMPLAINT_NOT_FOUND',
          message: 'Complaint ticket not found',
        });
      }

      // Self-voting prevention rule
      if (complaint.reportedBy === user.name || (complaint.citizenId && complaint.citizenId === user.uid)) {
        return res.status(400).json({
          success: false,
          errorCode: 'SELF_VOTE_DENIED',
          message: 'Self-voting prevention rule: You cannot verify or upvote your own reported complaint',
        });
      }

      // Enforce single-vote restriction
      const existingVote = await VerificationRepository.findVote(complaintId, user.uid);
      if (existingVote) {
        return res.status(400).json({
          success: false,
          errorCode: 'DUPLICATE_VOTE',
          message: 'You have already verified this complaint',
        });
      }

      // Record the vote
      await VerificationRepository.castVote(complaintId, user.uid, voteType);
      
      // Increment upvote count on complaint
      await ComplaintRepository.incrementUpvotes(complaintId);

      // Reward verifier with points
      await UserRepository.updatePoints(user.uid, 15);

      await LogRepository.log(`[DB] Logged citizen verification on ticket ${complaint.id} by ${user.name}`, 'DB');

      // Return updated upvotes count
      const updatedComplaint = await ComplaintRepository.findById(complaintId);
      res.json({
        success: true,
        data: {
          upvotes: updatedComplaint ? updatedComplaint.upvotes : 0
        }
      });

    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }

  static async getSummary(req: Request, res: Response) {
    try {
      const summary = await VerificationRepository.getSummary(req.params.complaintId);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }
}
export default VerificationController;
