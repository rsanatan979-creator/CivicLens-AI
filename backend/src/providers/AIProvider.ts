export interface AIResponse {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedDept: string;
  confidence: number;
  description: string;
}

export abstract class AIProvider {
  abstract predict(imageUrl: string): Promise<AIResponse>;
}
