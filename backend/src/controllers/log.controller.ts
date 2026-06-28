import { Request, Response } from 'express';
import { LogRepository } from '../repositories/log.repository.ts';

export class LogController {
  static async list(req: Request, res: Response) {
    try {
      const results = await LogRepository.getAll();
      res.json({ success: true, data: results });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { text, type } = req.body;
      if (!text || !type) {
        return res.status(400).json({ success: false, message: 'Text and type are required' });
      }
      const result = await LogRepository.log(text, type);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, errorCode: 'DB_ERROR', message: error.message });
    }
  }
}
export default LogController;
