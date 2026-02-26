import { Streak } from '../../models/Streak';
import { isSameUTCDay } from '../../utils/helpers';
import { logger } from '../../utils/logger';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Pure function — computes updated streak values given last activity date.
 */
export function computeStreak(
  lastActivityDate: Date | undefined,
  today: Date,
  currentStreak: number,
  longestStreak: number
): StreakResult {
  if (!lastActivityDate) {
    // First ever activity
    return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1) };
  }

  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  if (isSameUTCDay(lastActivityDate, today)) {
    // Already active today — no change
    return { currentStreak, longestStreak };
  } else if (isSameUTCDay(lastActivityDate, yesterday)) {
    // Active yesterday — extend streak
    const newStreak = currentStreak + 1;
    return { currentStreak: newStreak, longestStreak: Math.max(longestStreak, newStreak) };
  } else {
    // Streak broken — reset to 1
    return { currentStreak: 1, longestStreak };
  }
}

/**
 * Persists updated streak to DB and returns new values.
 */
export async function updateUserStreak(userId: string): Promise<StreakResult> {
  const today = new Date();

  let streak = await Streak.findOne({ user: userId });

  if (!streak) {
    streak = await Streak.create({
      user: userId,
      currentStreak: 1,
      longestStreak: 1,
      dailyStreak: 1,
      lastActivityDate: today,
    });
    return { currentStreak: 1, longestStreak: 1 };
  }

  const result = computeStreak(streak.lastActivityDate, today, streak.currentStreak, streak.longestStreak);

  streak.currentStreak = result.currentStreak;
  streak.longestStreak = result.longestStreak;
  streak.dailyStreak = result.currentStreak;
  streak.lastActivityDate = today;
  await streak.save();

  logger.info(`Streak updated for user ${userId}: current=${result.currentStreak}`);
  return result;
}
