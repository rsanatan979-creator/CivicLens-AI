import { Request, Response, NextFunction } from 'express';
import { winstonLogger } from '../utils/logger.ts';

export interface AppError extends Error {
  status?: number;
  errorCode?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred.';

  // Log in Winston
  winstonLogger.error({
    message: err.message,
    errorCode,
    status,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(status).json({
    success: false,
    errorCode,
    message,
    details: err.details || null,
  });
}
