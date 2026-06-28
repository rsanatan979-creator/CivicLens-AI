import { Request, Response, NextFunction } from 'express';
import { winstonLogger } from '../utils/logger.ts';
import crypto from 'crypto';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Generate or extract a unique Request ID
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  
  // Set response header
  res.setHeader('X-Request-ID', requestId);

  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    winstonLogger.info({
      message: `Request processed: ${req.method} ${req.originalUrl}`,
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: parseFloat(timeInMs),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}

export default requestLogger;
