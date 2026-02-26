import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../../src/app';

// Set required env vars before importing config
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-at-least-16-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-16-chars';
process.env.BCRYPT_ROUNDS = '4'; // Fast for tests
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.PORT = '3001';

// Mock Redis and BullMQ to avoid needing a real Redis in tests
jest.mock('../../src/config/redis', () => ({
  redis: {
    connect: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
  },
  connectRedis: jest.fn(),
}));

jest.mock('../../src/config/bull', () => ({
  scheduleRecurringJobs: jest.fn(),
  cardGenerationQueue: { add: jest.fn() },
  analyticsQueue: { add: jest.fn() },
  streakQueue: { add: jest.fn() },
}));

let mongod: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clean up all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('POST /v1/auth/register', () => {
  it('creates a new user and returns tokens', async () => {
    const res = await request(app).post('/v1/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('alice@example.com');
  });

  it('returns 409 if email already registered', async () => {
    await request(app).post('/v1/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/v1/auth/register').send({
      name: 'Alice 2',
      email: 'alice@example.com',
      password: 'password456',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_IN_USE');
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app).post('/v1/auth/register').send({
      name: 'Bob',
      email: 'not-an-email',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for password under 8 chars', async () => {
    const res = await request(app).post('/v1/auth/register').send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'short',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/v1/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });
  });

  it('returns tokens on valid credentials', async () => {
    const res = await request(app).post('/v1/auth/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/v1/auth/login').send({
      email: 'alice@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /v1/auth/refresh', () => {
  it('issues a new access token', async () => {
    const reg = await request(app).post('/v1/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .post('/v1/auth/refresh')
      .send({ refreshToken: reg.body.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    // Tokens should be rotated
    expect(res.body.refreshToken).not.toBe(reg.body.refreshToken);
  });
});
