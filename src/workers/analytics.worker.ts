import 'dotenv/config';
import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { connectDatabase } from '../config/database';
import { CardAnalytics } from '../models/CardAnalytics';
import { UserProgress } from '../models/UserProgress';
import { calculateLifeScore } from '../modules/progress/life-score-calculator';
import { logger } from '../utils/logger';

async function start() {
  await connectDatabase();
  await redis.connect();

  const worker = new Worker(
    'analytics-aggregation',
    async (job) => {
      logger.info(`[analytics] Starting aggregation job ${job.id}`);

      // Aggregate recent completions per user per domain
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const recentCompletions = await CardAnalytics.find({
        actionDate: { $gte: oneHourAgo },
        actionType: 'completed',
      }).populate('card');

      // Group by user
      const userMap = new Map<string, string[]>();
      for (const record of recentCompletions) {
        const uid = String(record.user);
        if (!userMap.has(uid)) userMap.set(uid, []);
        userMap.get(uid)!.push(String((record.card as any)?.domain));
      }

      logger.info(`[analytics] Processed activity for ${userMap.size} users`);
    },
    { connection: redis }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[analytics] Job ${job?.id} failed:`, err);
  });

  logger.info('✅ Analytics worker started');
}

start().catch((err) => {
  logger.error('Worker failed to start:', err);
  process.exit(1);
});
