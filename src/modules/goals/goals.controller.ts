import { Response, NextFunction, Router } from 'express';
import { z } from 'zod';
import { UserGoal } from '../../models/UserGoal';
import { AppError } from '../../middleware/error-handler';
import { AuthRequest, authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validator';

// ─── Validation ───────────────────────────────────────────────────────────────

const createGoalSchema = z.object({
  domain: z.enum(['health', 'finance', 'productivity', 'mindfulness']),
  description: z.string().min(1).max(500),
  targetValue: z.number().positive(),
  unit: z.string().min(1).max(50),
});

const updateGoalSchema = z.object({
  currentValue: z.number().min(0).optional(),
  isCompleted: z.boolean().optional(),
  description: z.string().min(1).max(500).optional(),
});

// ─── Handlers ────────────────────────────────────────────────────────────────

async function getGoals(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const goals = await UserGoal.find({ user: req.userId });
    res.json({ goals });
  } catch (err) { next(err); }
}

async function createGoal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const goal = await UserGoal.create({ ...req.body, user: req.userId });
    res.status(201).json({ goal });
  } catch (err) { next(err); }
}

async function updateGoal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const goal = await UserGoal.findOneAndUpdate(
      { _id: req.params.goalId, user: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!goal) throw new AppError(404, 'NOT_FOUND', 'Goal not found');
    res.json({ goal });
  } catch (err) { next(err); }
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const goalsRouter = Router();
goalsRouter.use(authenticate);

goalsRouter.get('/', getGoals);
goalsRouter.post('/', validate(createGoalSchema), createGoal);
goalsRouter.put('/:goalId', validate(updateGoalSchema), updateGoal);
