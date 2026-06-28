import { prisma } from '../config/prisma.ts';
import { VoteType } from '../types/enums.ts';
import { winstonLogger } from '../utils/logger.ts';

const voteTypeMap: Record<string, VoteType> = {
  valid: VoteType.VALID,
  duplicate: VoteType.DUPLICATE,
  resolved: VoteType.RESOLVED,
  VALID: VoteType.VALID,
  DUPLICATE: VoteType.DUPLICATE,
  RESOLVED: VoteType.RESOLVED,
};

export class VerificationRepository {
  static async findVote(complaintId: string, userId: string) {
    const start = process.hrtime();
    try {
      const vote = await prisma.verification.findUnique({
        where: {
          complaintId_citizenId: {
            complaintId,
            citizenId: userId,
          },
        },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] findVote took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return vote;
    } catch (error) {
      winstonLogger.error(`Error finding vote for complaint ${complaintId} and user ${userId}:`, error);
      throw new Error('Database error looking up verification vote', { cause: error });
    }
  }

  static async castVote(complaintId: string, userId: string, voteType: 'valid' | 'duplicate' | 'resolved') {
    const start = process.hrtime();
    try {
      const voteUpper = voteTypeMap[voteType] || VoteType.VALID;
      const newVote = await prisma.verification.create({
        data: {
          id: `v-${Date.now()}`,
          complaintId,
          citizenId: userId,
          voteType: voteUpper,
        },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] castVote took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return newVote;
    } catch (error) {
      winstonLogger.error(`Error casting vote on complaint ${complaintId} by user ${userId}:`, error);
      throw new Error('Database error logging verification vote', { cause: error });
    }
  }

  static async getSummary(complaintId: string) {
    const start = process.hrtime();
    try {
      const votes = await prisma.verification.findMany({
        where: { complaintId },
      });

      const validCount = votes.filter(v => v.voteType === VoteType.VALID).length;
      const duplicateCount = votes.filter(v => v.voteType === VoteType.DUPLICATE).length;
      const resolvedCount = votes.filter(v => v.voteType === VoteType.RESOLVED).length;

      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] getSummary verifications took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);

      return {
        complaintId,
        totalVotes: votes.length,
        breakdown: {
          valid: validCount,
          duplicate: duplicateCount,
          resolved: resolvedCount,
        },
      };
    } catch (error) {
      winstonLogger.error(`Error getting vote summary for complaint ${complaintId}:`, error);
      throw new Error('Database error generating verification summary', { cause: error });
    }
  }
}
