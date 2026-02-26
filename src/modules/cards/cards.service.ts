import { UserDailyCard } from '../../models/UserDailyCard';
import { CardAnalytics } from '../../models/CardAnalytics';
import { UserProgress } from '../../models/UserProgress';
import { CoachingCard } from '../../models/CoachingCard';
import { AppError } from '../../middleware/error-handler';
import { getTodayUTC } from '../../utils/helpers';
import { updateDomainScore, calculateLifeScore } from '../progress/life-score-calculator';
import { updateUserStreak } from '../progress/streak.service';
import { Domain } from '../../models/UserFocusArea';
import { generateDailyCardsForUser } from './ai-card-generator';

/** Returns today's cards for the user, generating them first if needed */
export async function getDailyCards(userId: string) {
  await generateDailyCardsForUser(userId);

  const today = getTodayUTC();
  const cards = await UserDailyCard.find({ user: userId, assignedDate: today }).populate('card');
  return cards;
}

export async function completeCard(userId: string, cardId: string) {
  const daily = await UserDailyCard.findOne({ user: userId, card: cardId }).populate<{
    card: InstanceType<typeof CoachingCard>;
  }>('card');

  if (!daily) throw new AppError(404, 'NOT_FOUND', 'Card not assigned to you today');
  if (daily.completedDate) throw new AppError(409, 'ALREADY_COMPLETED', 'Card already completed');

  daily.completedDate = new Date();
  await daily.save();

  const card = daily.card as any;
  const progress = await UserProgress.findOne({ user: userId });
  if (!progress) throw new AppError(404, 'NOT_FOUND', 'Progress not found');

  // Update the relevant domain score
  const domainField = `${card.domain}Score` as keyof typeof progress;
  const currentScore = progress[domainField] as number;
  const newScore = updateDomainScore(currentScore, card.difficulty, card.impact, 'completed');
  (progress as any)[domainField] = newScore;

  // Recalculate life score
  progress.lifeScore = calculateLifeScore({
    health: progress.healthScore,
    finance: progress.financeScore,
    productivity: progress.productivityScore,
    mindfulness: progress.mindfulnessScore,
  });

  progress.lifePoints += card.points;
  progress.totalCardsCompleted += 1;
  await progress.save();

  // Update streak
  const streakResult = await updateUserStreak(userId);
  progress.currentStreak = streakResult.currentStreak;
  progress.longestStreak = streakResult.longestStreak;
  await progress.save();

  // Record analytics
  await CardAnalytics.create({
    user: userId,
    card: cardId,
    actionDate: new Date(),
    actionType: 'completed',
  });

  return {
    success: true,
    pointsEarned: card.points,
    updatedProgress: progress,
  };
}

export async function snoozeCard(userId: string, cardId: string, snoozeDurationHours: number) {
  const daily = await UserDailyCard.findOne({ user: userId, card: cardId });
  if (!daily) throw new AppError(404, 'NOT_FOUND', 'Card not assigned to you today');

  const snoozedUntil = new Date();
  snoozedUntil.setHours(snoozedUntil.getHours() + snoozeDurationHours);
  daily.snoozedUntil = snoozedUntil;
  await daily.save();

  await CardAnalytics.create({
    user: userId,
    card: cardId,
    actionDate: new Date(),
    actionType: 'snoozed',
  });

  return daily;
}

export async function toggleBookmark(userId: string, cardId: string) {
  const daily = await UserDailyCard.findOne({ user: userId, card: cardId });
  if (!daily) throw new AppError(404, 'NOT_FOUND', 'Card not found');

  daily.isBookmarked = !daily.isBookmarked;
  await daily.save();

  await CardAnalytics.create({
    user: userId,
    card: cardId,
    actionDate: new Date(),
    actionType: 'bookmarked',
  });

  return daily;
}

export async function updateNote(userId: string, cardId: string, note: string) {
  const daily = await UserDailyCard.findOne({ user: userId, card: cardId });
  if (!daily) throw new AppError(404, 'NOT_FOUND', 'Card not found');

  daily.userNote = note;
  await daily.save();
  return daily;
}
