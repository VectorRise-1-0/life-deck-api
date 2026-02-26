import 'dotenv/config';
import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { generateDailyCardsForUser } from '../modules/cards/ai-card-generator';
import { logger } from '../utils/logger';

async function start() {
  await connectDatabase();
  await redis.connect();

  const worker = new Worker(
    'card-generation',
    async (job) => {
      logger.info(`[card-generation] Starting job ${job.id}`);
      const users = await User.find({}, '_id').lean();

      let succeeded = 0;
      let failed = 0;

      for (const user of users) {
        try {
          await generateDailyCardsForUser(String(user._id));
          succeeded++;
        } catch (err) {
          failed++;
          logger.error(`Failed to generate cards for user ${user._id}:`, err);
        }
      }

      logger.info(`[card-generation] Done. Success: ${succeeded}, Failed: ${failed}`);
    },
    { connection: redis, concurrency: 5 }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[card-generation] Job ${job?.id} failed:`, err);
  });

  logger.info('✅ Card generation worker started');
}

start().catch((err) => {
  logger.error('Worker failed to start:', err);
  process.exit(1);
});
