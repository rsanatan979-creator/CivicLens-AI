import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.ts';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        errorCode: 'FORBIDDEN',
        message: 'Access Denied: Insufficient permissions to access this resource',
      });
    }
    next();
  };
};
