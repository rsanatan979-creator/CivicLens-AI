export enum Role {
  CITIZEN = 'CITIZEN',
  OFFICIAL = 'OFFICIAL',
  ADMIN = 'ADMIN'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  INVESTIGATING = 'INVESTIGATING',
  QUEUED = 'QUEUED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum VoteType {
  VALID = 'VALID',
  DUPLICATE = 'DUPLICATE',
  RESOLVED = 'RESOLVED'
}
