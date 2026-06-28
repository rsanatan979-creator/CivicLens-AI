import { z } from 'zod';

export const CastVoteSchema = z.object({
  complaintId: z.string().min(1, 'Complaint ID is required'),
  voteType: z.enum(['valid', 'duplicate', 'resolved']).default('valid'),
});
