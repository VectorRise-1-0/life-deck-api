import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { UserProgress } from '../../models/UserProgress';
import { AppError } from '../../middleware/error-handler';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';

export async function getProgress(req: AuthRequest, res: Response): Promise<void> {
  const progress = await UserProgress.findOne({ user: req.userId });
  if (!progress) throw new AppError(404, 'NOT_FOUND', 'Progress record not found');
  res.json({ progress });
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const progressRouter = Router();
progressRouter.use(authenticate);
progressRouter.get('/', getProgress);
