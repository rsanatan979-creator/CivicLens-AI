import { prisma } from '../config/prisma.ts';
import { Role } from '../types/enums.ts';
import { winstonLogger } from '../utils/logger.ts';

export class UserRepository {
  static async findByUid(uid: string) {
    const start = process.hrtime();
    try {
      const user = await prisma.user.findUnique({ where: { uid } });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] findByUid took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return user;
    } catch (error) {
      winstonLogger.error(`Error in findByUid for UID ${uid}:`, error);
      throw new Error(`Database error retrieving user`, { cause: error });
    }
  }

  static async findByEmail(email: string) {
    const start = process.hrtime();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] findByEmail took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return user;
    } catch (error) {
      winstonLogger.error(`Error in findByEmail for email ${email}:`, error);
      throw new Error(`Database error retrieving user by email`, { cause: error });
    }
  }

  static async createUser(uid: string, email: string, name: string, passwordHash: string) {
    const start = process.hrtime();
    try {
      const joinedAtStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const role: Role = email.endsWith('.gov') || email === 'official@city.gov' ? 'OFFICIAL' : 'CITIZEN';
      const newUser = await prisma.user.create({
        data: {
          uid,
          email,
          name,
          role,
          points: 100,
          joinedAt: joinedAtStr,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          passwordHash,
        },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] createUser took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return newUser;
    } catch (error) {
      winstonLogger.error(`Error in createUser for email ${email}:`, error);
      throw new Error(`Database error creating credentials user`, { cause: error });
    }
  }

  static async getOrCreateUser(uid: string, email: string, name: string) {
    const start = process.hrtime();
    try {
      const joinedAtStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const role: Role = email.endsWith('.gov') || email === 'official@city.gov' ? 'OFFICIAL' : 'CITIZEN';
      
      const user = await prisma.user.upsert({
        where: { uid },
        update: {},
        create: {
          uid,
          email,
          name,
          role,
          points: 100,
          joinedAt: joinedAtStr,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] getOrCreateUser took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return user;
    } catch (error) {
      winstonLogger.error(`Error in getOrCreateUser for UID ${uid}:`, error);
      throw new Error(`Database error creating user`, { cause: error });
    }
  }

  static async updatePoints(uid: string, pointsDelta: number) {
    const start = process.hrtime();
    try {
      const updated = await prisma.user.update({
        where: { uid },
        data: {
          points: {
            increment: pointsDelta,
          },
        },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] updatePoints took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return updated;
    } catch (error) {
      winstonLogger.error(`Error updating points for UID ${uid}:`, error);
      throw new Error(`Database error updating user points`, { cause: error });
    }
  }

  static async updateName(uid: string, name: string) {
    const start = process.hrtime();
    try {
      const updated = await prisma.user.update({
        where: { uid },
        data: { name },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] updateName took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return updated;
    } catch (error) {
      winstonLogger.error(`Error updating name for UID ${uid}:`, error);
      throw new Error(`Database error updating user name`, { cause: error });
    }
  }

  static async setRole(uid: string, role: string) {
    const start = process.hrtime();
    try {
      const updated = await prisma.user.update({
        where: { uid },
        data: { role: role as Role },
      });
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] setRole took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return updated;
    } catch (error) {
      winstonLogger.error(`Error updating role for UID ${uid}:`, error);
      throw new Error(`Database error updating user role`, { cause: error });
    }
  }

  static async allUsers() {
    const start = process.hrtime();
    try {
      const users = await prisma.user.findMany();
      const diff = process.hrtime(start);
      winstonLogger.debug(`[DB TIMING] allUsers took ${(diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2)}ms`);
      return users;
    } catch (error) {
      winstonLogger.error('Error fetching all users:', error);
      throw new Error('Database error retrieving users list', { cause: error });
    }
  }
}
