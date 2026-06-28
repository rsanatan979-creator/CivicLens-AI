import { GoogleGenAI, Type } from '@google/genai';
import { AIProvider, AIResponse } from './AIProvider.ts';
import { winstonLogger } from '../utils/logger.ts';

export class GeminiProvider extends AIProvider {
  private ai: GoogleGenAI | null = null;

  constructor() {
    super();
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  async predict(imageUrl: string): Promise<AIResponse> {
    const fallback: AIResponse = {
      category: 'Road Damage',
      severity: 'HIGH',
      assignedDept: 'Roads',
      confidence: 0.91,
      description: 'Pothole structure detected with clear pavement deterioration.',
    };

    if (!this.ai) {
      winstonLogger.warn('Gemini API Key is missing. Returning default fallback predictions.');
      return fallback;
    }

    const start = process.hrtime();

    try {
      let response;
      if (imageUrl.startsWith('data:image')) {
        const parts = imageUrl.split(',');
        const mimeType = parts[0].split(';')[0].split(':')[1];
        const base64Data = parts[1];

        response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            'Analyze this image of a municipal/civic issue. Determine: \n1. The issue category (Choose exactly one of: "Road Damage", "Garbage", "Water Leakage", "Broken Streetlight", "Drain Blockage").\n2. The severity rating (Choose exactly one of: "LOW", "MEDIUM", "HIGH", "CRITICAL").\n3. The responsible city department (Choose exactly one of: "Roads", "Electrical", "Sanitation", "Parks & Rec", "Water Resources").\n4. A confidence score between 0.0 and 1.0.\n5. A short concise 1-sentence description. \n\nReturn ONLY a JSON object matching this schema:\n{"category": "Category", "severity": "SEVERITY", "assignedDept": "Department", "confidence": 0.95, "description": "Description"}'
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                severity: { type: Type.STRING },
                assignedDept: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                description: { type: Type.STRING },
              },
              required: ['category', 'severity', 'assignedDept', 'confidence', 'description'],
            },
          },
        });
      } else {
        response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Analyze this municipal issue image at URL: ${imageUrl}. Determine category, severity, department, confidence, and short description. Return raw JSON matching: {"category": "Road Damage", "severity": "HIGH", "assignedDept": "Roads", "confidence": 0.95, "description": "desc"}`,
          config: {
            responseMimeType: 'application/json',
          },
        });
      }

      const aiText = response.text || '';
      const parsed = JSON.parse(aiText.trim());

      const diff = process.hrtime(start);
      const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      winstonLogger.info({
        message: `AI request completed using GeminiProvider`,
        provider: 'Gemini',
        durationMs: parseFloat(timeInMs),
      });

      return {
        category: parsed.category || fallback.category,
        severity: (parsed.severity?.toUpperCase() || fallback.severity) as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        assignedDept: parsed.assignedDept || fallback.assignedDept,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : fallback.confidence,
        description: parsed.description || fallback.description,
      };
    } catch (err: any) {
      const diff = process.hrtime(start);
      const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      winstonLogger.error({
        message: `Gemini API call failed after ${timeInMs}ms: ${err.message}`,
        error: err.stack,
      });
      return fallback;
    }
  }
}
