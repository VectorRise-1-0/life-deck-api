import { Queue } from 'bullmq';
import { redis } from './redis';

const connection = redis;

// Daily card generation queue — runs at 00:00 UTC
export const cardGenerationQueue = new Queue('card-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// Hourly analytics aggregation queue
export const analyticsQueue = new Queue('analytics-aggregation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

// Daily streak reset queue
export const streakQueue = new Queue('streak-reset', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

/**
 * Schedule recurring jobs using BullMQ's repeat option.
 * Call this once at server startup.
 */
export async function scheduleRecurringJobs(): Promise<void> {
  // Daily card generation at midnight UTC
  await cardGenerationQueue.add(
    'generate-daily-cards',
    {},
    { repeat: { pattern: '0 0 * * *' } }
  );

  // Hourly analytics
  await analyticsQueue.add(
    'aggregate-analytics',
    {},
    { repeat: { pattern: '0 * * * *' } }
  );

  // Daily streak reset at 00:05 UTC (after card generation)
  await streakQueue.add(
    'reset-streaks',
    {},
    { repeat: { pattern: '5 0 * * *' } }
  );
}
