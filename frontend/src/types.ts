export * from './shared/types.ts';

export type View =
  | 'SPLASH'
  | 'LOGIN'
  | 'REGISTER'
  // Citizen Views
  | 'CITIZEN_HOME'
  | 'CITIZEN_REPORT'
  | 'CITIZEN_VERIFY'
  | 'CITIZEN_PROFILE'
  | 'CITIZEN_DETAILS'
  // Official Views
  | 'OFFICIAL_DASHBOARD'
  | 'OFFICIAL_COMPLAINTS'
  | 'OFFICIAL_COMPLAINT_DETAIL'
  | 'OFFICIAL_ANALYTICS'
  | 'OFFICIAL_PREDICTIONS';

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'alert' | 'trend' | 'anomaly';
  priority: 'high' | 'medium' | 'low';
}
