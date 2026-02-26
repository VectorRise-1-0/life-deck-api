import 'dotenv/config';
import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { connectDatabase } from '../config/database';
import { Streak } from '../models/Streak';
import { UserProgress } from '../models/UserProgress';
import { isSameUTCDay, getTodayUTC } from '../utils/helpers';
import { logger } from '../utils/logger';

async function start() {
  await connectDatabase();
  await redis.connect();

  const worker = new Worker(
    'streak-reset',
    async (job) => {
      logger.info(`[streak-reset] Starting job ${job.id}`);
      const today = getTodayUTC();
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);

      // Find all streaks where lastActivityDate is before yesterday (streak broken)
      const brokenStreaks = await Streak.find({
        lastActivityDate: { $lt: yesterday },
        currentStreak: { $gt: 0 },
      });

      for (const streak of brokenStreaks) {
        streak.currentStreak = 0;
        streak.dailyStreak = 0;
        await streak.save();

        // Sync to UserProgress
        await UserProgress.updateOne(
          { user: streak.user },
          { $set: { currentStreak: 0 } }
        );
      }

      logger.info(`[streak-reset] Reset ${brokenStreaks.length} broken streaks`);
    },
    { connection: redis }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[streak-reset] Job ${job?.id} failed:`, err);
  });

  logger.info('✅ Streak reset worker started');
}

start().catch((err) => {
  logger.error('Worker failed to start:', err);
  process.exit(1);
});
