import { User } from '../../models/User';
import { UserProgress } from '../../models/UserProgress';
import { UserSettings } from '../../models/UserSettings';
import { Subscription } from '../../models/Subscription';
import { UserDailyCard } from '../../models/UserDailyCard';
import { UserGoal } from '../../models/UserGoal';
import { UserAchievement } from '../../models/Achievement';
import { CardAnalytics } from '../../models/CardAnalytics';
import { Streak } from '../../models/Streak';
import { RefreshToken } from '../../models/RefreshToken';
import { AppError } from '../../middleware/error-handler';

export async function getProfile(userId: string) {
  const [user, progress, settings, subscription] = await Promise.all([
    User.findById(userId).select('-passwordHash -__v'),
    UserProgress.findOne({ user: userId }),
    UserSettings.findOne({ user: userId }),
    Subscription.findOne({ user: userId }),
  ]);

  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  return { user, progress, settings, subscription };
}

export async function updateProfile(userId: string, data: { name?: string; email?: string }) {
  if (data.email) {
    const existing = await User.findOne({ email: data.email, _id: { $ne: userId } });
    if (existing) throw new AppError(409, 'EMAIL_IN_USE', 'That email is already taken');
  }

  const user = await User.findByIdAndUpdate(userId, data, { new: true }).select('-passwordHash -__v');
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return user;
}

export async function getSettings(userId: string) {
  const settings = await UserSettings.findOne({ user: userId });
  if (!settings) throw new AppError(404, 'NOT_FOUND', 'Settings not found');
  return settings;
}

export async function updateSettings(userId: string, data: Record<string, unknown>) {
  const settings = await UserSettings.findOneAndUpdate(
    { user: userId },
    { $set: data },
    { new: true, upsert: true }
  );
  return settings;
}

/** Returns all user data for GDPR export */
export async function exportUserData(userId: string) {
  const [user, progress, settings, subscription, goals, achievements, cards, analytics] =
    await Promise.all([
      User.findById(userId).select('-passwordHash'),
      UserProgress.findOne({ user: userId }),
      UserSettings.findOne({ user: userId }),
      Subscription.findOne({ user: userId }),
      UserGoal.find({ user: userId }),
      UserAchievement.find({ user: userId }).populate('achievement'),
      UserDailyCard.find({ user: userId }).populate('card'),
      CardAnalytics.find({ user: userId }),
    ]);

  return { user, progress, settings, subscription, goals, achievements, cards, analytics };
}

/** Hard-deletes all user data */
export async function deleteAccount(userId: string): Promise<void> {
  await Promise.all([
    User.findByIdAndDelete(userId),
    UserProgress.deleteOne({ user: userId }),
    UserSettings.deleteOne({ user: userId }),
    Subscription.deleteOne({ user: userId }),
    Streak.deleteOne({ user: userId }),
    UserGoal.deleteMany({ user: userId }),
    UserAchievement.deleteMany({ user: userId }),
    UserDailyCard.deleteMany({ user: userId }),
    CardAnalytics.deleteMany({ user: userId }),
    RefreshToken.deleteMany({ user: userId }),
  ]);
}
