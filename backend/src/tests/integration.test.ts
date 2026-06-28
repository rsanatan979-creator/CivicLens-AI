import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import apiRouter from '../routes/api.ts';
import { errorHandler } from '../middleware/errorHandler.ts';

// Configure a test instance of the application
const testApp = express();
testApp.use(express.json());
testApp.use('/api/v1', apiRouter);
testApp.use(errorHandler as any);

// Mock database connection for integration tests to prevent dependency on dynamic SQL container
import { UserRepository } from '../repositories/user.repository.ts';
import { LogRepository } from '../repositories/log.repository.ts';

test('🔗 [INTEGRATION TEST] Auth Registration & Profile Fetch Flow', async (t) => {
  // Set up mock repository functions
  const mockDbUsers = new Map<string, any>();

  const originalCreate = UserRepository.createUser;
  const originalFindByEmail = UserRepository.findByEmail;
  const originalFindByUid = UserRepository.findByUid;
  const originalLog = LogRepository.log;

  LogRepository.log = async (text: string, type: 'SYS' | 'AI' | 'DB' | 'WARN') => {
    return { id: 'mock-log-id', text, type, timestamp: '12:00:00' };
  };

  UserRepository.createUser = async (uid, email, name, passwordHash) => {
    const user = {
      uid,
      email,
      name,
      role: 'CITIZEN',
      points: 100,
      joinedAt: 'Jun 25, 2026',
      avatarUrl: 'http://avatar.com',
      passwordHash,
    };
    mockDbUsers.set(email, user);
    mockDbUsers.set(uid, user);
    return user;
  };

  UserRepository.findByEmail = async (email) => {
    return mockDbUsers.get(email) || null;
  };

  UserRepository.findByUid = async (uid) => {
    return mockDbUsers.get(uid) || null;
  };

  // Restore originals after tests run
  t.after(() => {
    UserRepository.createUser = originalCreate;
    UserRepository.findByEmail = originalFindByEmail;
    UserRepository.findByUid = originalFindByUid;
    LogRepository.log = originalLog;
  });

  let jwtToken = '';

  await t.test('Step 1: Register a new user account with credentials', async () => {
    const payload = {
      name: 'Integration User',
      email: 'integration@test.com',
      password: 'password123',
    };

    const response = await request(testApp)
      .post('/api/v1/auth/register')
      .send(payload)
      .expect(201);

    assert.strictEqual(response.body.success, true);
    assert.ok(response.body.data.token, 'Token must be provided upon registration');
    assert.strictEqual(response.body.data.user.email, payload.email);
    assert.strictEqual(response.body.data.user.name, payload.name);
  });

  await t.test('Step 2: Log in using the registered credentials', async () => {
    const payload = {
      email: 'integration@test.com',
      password: 'password123',
    };

    const response = await request(testApp)
      .post('/api/v1/auth/login')
      .send(payload)
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.ok(response.body.data.token, 'Token must be provided upon login');
    jwtToken = response.body.data.token;
  });

  await t.test('Step 3: Retrieve profile using the obtained Bearer token', async () => {
    assert.ok(jwtToken, 'JWT Token must exist from previous step');

    const response = await request(testApp)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.email, 'integration@test.com');
    assert.strictEqual(response.body.data.role, 'CITIZEN');
  });
});
