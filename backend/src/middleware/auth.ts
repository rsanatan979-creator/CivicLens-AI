import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.ts';
import { winstonLogger } from '../utils/logger.ts';
import { config } from '../config/env.ts';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    name: string;
    email: string;
    role: 'CITIZEN' | 'OFFICIAL' | 'ADMIN';
    points: number;
    joinedAt: string;
    avatarUrl: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      errorCode: 'UNAUTHORIZED',
      message: 'Authentication token is required',
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    let uid = '';
    let email = '';
    let name = '';

    try {
      // Verify JWT using the verified JWT_SECRET from config
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      uid = decoded.userId;
      email = decoded.email;
      name = decoded.name;
    } catch (jwtError) {
      throw new Error('Authentication token is invalid or expired');
    }

    // Ensure the user profile exists in our PostgreSQL/Drizzle database layer
    const user = await UserRepository.findByUid(uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: 'USER_NOT_FOUND',
        message: 'No user profile associated with this authenticated account',
      });
    }

    req.user = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role as 'CITIZEN' | 'OFFICIAL' | 'ADMIN',
      points: user.points,
      joinedAt: user.joinedAt,
      avatarUrl: user.avatarUrl,
    };

    next();
  } catch (error: any) {
    winstonLogger.warn(`Authentication token verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      errorCode: 'UNAUTHORIZED',
      message: 'Invalid or expired authentication session',
    });
  }
};
