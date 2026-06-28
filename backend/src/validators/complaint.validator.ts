import { z } from 'zod';

export const CreateComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  category: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  imageUrl: z.string().url('Invalid image URL'),
  locationName: z.string().min(3, 'Location name must be at least 3 characters long'),
  latitude: z.number(),
  longitude: z.number(),
  assignedDept: z.string().default('Municipal Admin'),
  aiConfidence: z.number().min(0).max(1).default(1.0),
});

export const UpdateComplaintSchema = z.object({
  status: z.enum(['PENDING', 'INVESTIGATING', 'QUEUED', 'SCHEDULED', 'IN_PROGRESS', 'RESOLVED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedDept: z.string().optional(),
});
