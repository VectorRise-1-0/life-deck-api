import { CoachingCard } from '../../models/CoachingCard';
import { UserDailyCard } from '../../models/UserDailyCard';
import { UserFocusArea } from '../../models/UserFocusArea';
import { UserProgress } from '../../models/UserProgress';
import { Subscription } from '../../models/Subscription';
import { getTodayUTC } from '../../utils/helpers';
import { logger } from '../../utils/logger';

const CARDS_PER_DAY = 4;

/**
 * Deterministic mock card selection:
 * 1. Finds user's focus areas and low-scoring domains.
 * 2. Fetches matching CoachingCards (respecting premium status).
 * 3. Assigns them to UserDailyCard for today.
 */
export async function generateDailyCardsForUser(userId: string): Promise<void> {
  const today = getTodayUTC();

  // Avoid duplicates if already generated today
  const existing = await UserDailyCard.countDocuments({ user: userId, assignedDate: today });
  if (existing > 0) {
    logger.debug(`Cards already generated for user ${userId} today`);
    return;
  }

  const [focusAreas, progress, subscription] = await Promise.all([
    UserFocusArea.find({ user: userId }),
    UserProgress.findOne({ user: userId }),
    Subscription.findOne({ user: userId }),
  ]);

  const isPremium = subscription?.tier === 'premium';

  // Determine priority domains: focus areas + any domain scoring below 60
  const priorityDomains = new Set<string>(focusAreas.map((f) => f.domain));
  if (progress) {
    if (progress.healthScore < 60) priorityDomains.add('health');
    if (progress.financeScore < 60) priorityDomains.add('finance');
    if (progress.productivityScore < 60) priorityDomains.add('productivity');
    if (progress.mindfulnessScore < 60) priorityDomains.add('mindfulness');
  }

  const domainList =
    priorityDomains.size > 0
      ? Array.from(priorityDomains)
      : ['health', 'finance', 'productivity', 'mindfulness'];

  // Query cards
  const query: Record<string, unknown> = { domain: { $in: domainList } };
  if (!isPremium) query.isPremium = false;

  const cards = await CoachingCard.find(query)
    .sort({ priority: -1, impact: -1 })
    .limit(CARDS_PER_DAY * 3); // over-fetch then slice

  const selectedCards = cards.slice(0, CARDS_PER_DAY);

  const dailyCards = selectedCards.map((card) => ({
    user: userId,
    card: card._id,
    assignedDate: today,
  }));

  if (dailyCards.length > 0) {
    await UserDailyCard.insertMany(dailyCards, { ordered: false });
    logger.info(`Generated ${dailyCards.length} cards for user ${userId}`);
  }
}
