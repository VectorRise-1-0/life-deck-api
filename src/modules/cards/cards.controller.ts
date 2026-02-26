import { Response, NextFunction, Router } from 'express';
import { z } from 'zod';
import { AuthRequest, authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validator';
import * as cardsService from './cards.service';

// ─── Validation ───────────────────────────────────────────────────────────────

const snoozeSchema = z.object({
  snoozeDuration: z.number().int().min(1).max(72),
});

const noteSchema = z.object({
  note: z.string().max(1000),
});

// ─── Handlers ────────────────────────────────────────────────────────────────

async function getDailyCards(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const cards = await cardsService.getDailyCards(req.userId!);
    res.json({ cards });
  } catch (err) { next(err); }
}

async function completeCard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await cardsService.completeCard(req.userId!, req.params.cardId);
    res.json(result);
  } catch (err) { next(err); }
}

async function snoozeCard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const card = await cardsService.snoozeCard(req.userId!, req.params.cardId, req.body.snoozeDuration);
    res.json({ card });
  } catch (err) { next(err); }
}

async function bookmarkCard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const card = await cardsService.toggleBookmark(req.userId!, req.params.cardId);
    res.json({ card });
  } catch (err) { next(err); }
}

async function updateNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const card = await cardsService.updateNote(req.userId!, req.params.cardId, req.body.note);
    res.json({ card });
  } catch (err) { next(err); }
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const cardsRouter = Router();
cardsRouter.use(authenticate);

cardsRouter.get('/daily', getDailyCards);
cardsRouter.post('/:cardId/complete', completeCard);
cardsRouter.post('/:cardId/snooze', validate(snoozeSchema), snoozeCard);
cardsRouter.post('/:cardId/bookmark', bookmarkCard);
cardsRouter.put('/:cardId/note', validate(noteSchema), updateNote);
