import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  lazyConnect: true,
});

redis.on('connect', () => logger.info('✅ Redis connected successfully'));
redis.on('error', (err) => logger.error('❌ Redis error:', err));

export async function connectRedis(): Promise<void> {
  await redis.connect();
}
