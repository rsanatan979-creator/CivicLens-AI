import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import apiRouter from '../routes/api.ts';
import { errorHandler } from '../middleware/errorHandler.ts';

// Create a test app instance
const testApp = express();
testApp.use(express.json());
testApp.use('/api/v1', apiRouter);
testApp.use(errorHandler as any);

test('🩺 [API TEST] Health Probes Gateways', async (t) => {
  await t.test('GET /api/v1/health returns 200 OK', async () => {
    // We mock/call HealthController.general
    const response = await request(testApp)
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.status, 'OK');
    assert.ok(response.body.timestamp);
  });
});

test('🛡️ [API TEST] Authentication Route Guards', async (t) => {
  await t.test('POST /api/v1/complaints should return 401 Unauthorized without Bearer token', async () => {
    const response = await request(testApp)
      .post('/api/v1/complaints')
      .send({
        title: 'Water pipe leak downtown',
        description: 'Large leak near main avenue',
        category: 'Water Leakage',
      })
      .expect(401);

    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.errorCode, 'UNAUTHORIZED');
  });

  await t.test('GET /api/v1/auth/profile should return 401 Unauthorized without Bearer token', async () => {
    const response = await request(testApp)
      .get('/api/v1/auth/profile')
      .expect(401);

    assert.strictEqual(response.body.success, false);
    assert.strictEqual(response.body.errorCode, 'UNAUTHORIZED');
  });
});
