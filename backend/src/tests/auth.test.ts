import test from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterSchema, LoginSchema } from '../validators/auth.validator.ts';

test('🔒 [UNIT TEST] Password Hashing & Verification', async (t) => {
  await t.test('should successfully hash and verify passwords using bcryptjs', async () => {
    const rawPassword = 'safePassword123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert.ok(hash, 'Hash should not be empty');
    assert.notStrictEqual(hash, rawPassword, 'Hash should be encrypted');

    const isMatch = await bcrypt.compare(rawPassword, hash);
    assert.strictEqual(isMatch, true, 'Correct password must match');

    const isNotMatch = await bcrypt.compare('wrongPassword', hash);
    assert.strictEqual(isNotMatch, false, 'Incorrect password must fail');
  });
});

test('📝 [UNIT TEST] Authentication Zod Validator Schema', async (t) => {
  await t.test('should validate conforming registration payload', () => {
    const payload = {
      name: 'John Doe',
      email: 'john.doe@domain.com',
      password: 'password123',
    };
    const result = RegisterSchema.safeParse(payload);
    assert.strictEqual(result.success, true, 'Conforming payload must pass');
  });

  await t.test('should reject invalid registration payloads', () => {
    const payload = {
      name: '',
      email: 'invalid-email',
      password: '123',
    };
    const result = RegisterSchema.safeParse(payload);
    assert.strictEqual(result.success, false, 'Invalid fields must fail');
  });

  await t.test('should validate conforming login payload', () => {
    const payload = {
      email: 'john.doe@domain.com',
      password: 'password123',
    };
    const result = LoginSchema.safeParse(payload);
    assert.strictEqual(result.success, true, 'Conforming login payload must pass');
  });
});

test('👤 [UNIT TEST] JWT Token Generation and Verification', async (t) => {
  await t.test('should sign and verify custom token payloads correctly', () => {
    const secret = 'test-jwt-secret-key';
    const payload = {
      userId: 'u-user123',
      email: 'citizen@domain.com',
      name: 'Jane Citizen',
      role: 'CITIZEN',
    };

    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    assert.ok(token, 'Token should be generated');

    const decoded = jwt.verify(token, secret) as any;
    assert.strictEqual(decoded.userId, payload.userId, 'Decoded user ID matches');
    assert.strictEqual(decoded.role, payload.role, 'Decoded role matches');
  });
});
