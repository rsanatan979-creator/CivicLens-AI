export enum UserRole {
  CITIZEN = 'CITIZEN',
  OFFICIAL = 'OFFICIAL',
  ADMIN = 'ADMIN'
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export const Severity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export type ComplaintStatus = 'PENDING' | 'INVESTIGATING' | 'QUEUED' | 'SCHEDULED' | 'IN_PROGRESS' | 'RESOLVED';
export const ComplaintStatus = {
  PENDING: 'PENDING',
  INVESTIGATING: 'INVESTIGATING',
  QUEUED: 'QUEUED',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED'
} as const;

export type Status = ComplaintStatus;
export const Status = ComplaintStatus;

export type VoteType = 'VALID' | 'DUPLICATE' | 'RESOLVED';
export const VoteType = {
  VALID: 'VALID',
  DUPLICATE: 'DUPLICATE',
  RESOLVED: 'RESOLVED'
} as const;

export interface TimelineItem {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  isCurrent?: boolean;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  status: ComplaintStatus;
  assignedDept: string;
  reportedBy: string;
  reportedByAvatar?: string;
  reportedAt?: string;
  createdAt?: string;
  imageUrl: string;
  locationName: string;
  latitude: number;
  longitude: number;
  timeline: TimelineItem[];
  upvotes: number;
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'SYS' | 'AI' | 'DB' | 'WARN';
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  points: number;
  joinedAt: string;
}
