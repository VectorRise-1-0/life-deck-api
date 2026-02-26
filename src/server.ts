import 'dotenv/config';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { scheduleRecurringJobs } from './config/bull';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    // Connect to infrastructure
    await connectDatabase();
    await connectRedis();

    // Schedule BullMQ recurring jobs (skip in test mode)
    if (env.NODE_ENV !== 'test') {
      await scheduleRecurringJobs();
    }

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 LifeDeck API running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // ─── Graceful shutdown ───────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        const { disconnectDatabase } = await import('./config/database');
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
