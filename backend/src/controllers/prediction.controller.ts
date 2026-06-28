import { Request, Response } from 'express';
import { PredictionRepository } from '../repositories/prediction.repository.ts';

export class PredictionController {
  static async list(req: Request, res: Response) {
    try {
      const results = await PredictionRepository.getAll();
      res.json({ success: true, data: results });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }
}
export default PredictionController;
