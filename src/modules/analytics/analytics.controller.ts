import { Response, NextFunction, Router } from 'express';
import { CardAnalytics } from '../../models/CardAnalytics';
import { UserProgress } from '../../models/UserProgress';
import { UserDailyCard } from '../../models/UserDailyCard';
import { Streak } from '../../models/Streak';
import { AuthRequest, authenticate } from '../../middleware/auth';

async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [progress, streak, recentAnalytics, cardStats] = await Promise.all([
      UserProgress.findOne({ user: userId }),
      Streak.findOne({ user: userId }),
      CardAnalytics.find({ user: userId, actionDate: { $gte: thirtyDaysAgo } }).sort({ actionDate: -1 }),
      CardAnalytics.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$actionType', count: { $sum: 1 } } },
      ]),
    ]);

    // Completion rate last 30 days
    const completed = recentAnalytics.filter((a) => a.actionType === 'completed').length;
    const total = recentAnalytics.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      progress,
      streak,
      completionRate,
      last30Days: {
        totalActions: total,
        byType: cardStats,
      },
    });
  } catch (err) { next(err); }
}

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);
analyticsRouter.get('/dashboard', getDashboard);
