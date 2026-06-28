import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RegisterSchema, LoginSchema } from '../validators/auth.validator.ts';
import { UserRepository } from '../repositories/user.repository.ts';
import { LogRepository } from '../repositories/log.repository.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { config } from '../config/env.ts';

const JWT_SECRET = config.JWT_SECRET;

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const parseResult = RegisterSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0].message,
        });
      }

      const { name, email, password } = parseResult.data;

      // Check if user already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          errorCode: 'USER_ALREADY_EXISTS',
          message: 'A user with this email address already exists',
        });
      }

      // Hash password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Generate UID
      const uid = crypto.randomUUID();

      // Create user
      const user = await UserRepository.createUser(uid, email, name, passwordHash);

      // Log registration event
      await LogRepository.log(`[SYS] User registered: ${user.name} (${user.email})`, 'SYS');

      // Generate JWT
      const token = jwt.sign(
        { userId: user.uid, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            uid: user.uid,
            name: user.name,
            email: user.email,
            role: user.role,
            points: user.points,
            joinedAt: user.joinedAt,
            avatarUrl: user.avatarUrl,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        message: error.message || 'Error during user registration',
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const parseResult = LoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0].message,
        });
      }

      const { email, password } = parseResult.data;

      let user = await UserRepository.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          errorCode: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      // Check if user has passwordHash (created via credentials)
      if (!user.passwordHash) {
        return res.status(401).json({
          success: false,
          errorCode: 'METHOD_NOT_SUPPORTED',
          message: 'This user does not have password credentials configured',
        });
      }

      // Verify bcrypt password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          errorCode: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.uid, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            uid: user.uid,
            name: user.name,
            email: user.email,
            role: user.role,
            points: user.points,
            joinedAt: user.joinedAt,
            avatarUrl: user.avatarUrl,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        message: error.message || 'Error during user login',
      });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          errorCode: 'UNAUTHORIZED',
          message: 'No active session found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        message: error.message || 'Error fetching user profile',
      });
    }
  }


  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          errorCode: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const { name, pointsDelta } = req.body;
      let updatedUser = await UserRepository.findByUid(user.uid);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          errorCode: 'USER_NOT_FOUND',
          message: 'User profile not found',
        });
      }

      if (name !== undefined) {
        updatedUser = await UserRepository.updateName(user.uid, name);
      }

      if (pointsDelta !== undefined && typeof pointsDelta === 'number') {
        updatedUser = await UserRepository.updatePoints(user.uid, pointsDelta);
      }

      await LogRepository.log(`[SYS] Profile updated for user ${user.name}: name=${name || 'unchanged'} pointsDelta=${pointsDelta || 0}`, 'SYS');

      res.json({
        success: true,
        data: {
          uid: updatedUser.uid,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          points: updatedUser.points,
          joinedAt: updatedUser.joinedAt,
          avatarUrl: updatedUser.avatarUrl,
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        message: error.message || 'Error updating user profile',
      });
    }
  }
}
export default AuthController;
