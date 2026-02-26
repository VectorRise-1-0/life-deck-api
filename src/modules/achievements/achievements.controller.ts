import { Response, NextFunction, Router } from 'express';
import { Achievement, UserAchievement } from '../../models/Achievement';
import { AuthRequest, authenticate } from '../../middleware/auth';

async function getAchievements(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [all, unlocked] = await Promise.all([
      Achievement.find(),
      UserAchievement.find({ user: req.userId }).select('achievement'),
    ]);

    const unlockedIds = new Set(unlocked.map((u) => String(u.achievement)));

    const achievements = all.map((a) => ({
      ...a.toObject(),
      isUnlocked: unlockedIds.has(String(a._id)),
    }));

    res.json({ achievements });
  } catch (err) { next(err); }
}

export const achievementsRouter = Router();
achievementsRouter.use(authenticate);
achievementsRouter.get('/', getAchievements);
