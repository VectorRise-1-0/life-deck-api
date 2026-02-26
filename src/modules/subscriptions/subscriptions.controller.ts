import { Response, NextFunction, Router } from 'express';
import { z } from 'zod';
import { Subscription } from '../../models/Subscription';
import { AppError } from '../../middleware/error-handler';
import { AuthRequest, authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validator';

const verifySchema = z.object({
  receiptData: z.string().min(1),
  productId: z.string().min(1),
});

async function getStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const subscription = await Subscription.findOne({ user: req.userId });
    if (!subscription) throw new AppError(404, 'NOT_FOUND', 'Subscription not found');
    res.json({ subscription });
  } catch (err) { next(err); }
}

/**
 * Stub Apple receipt verification for v1.
 * In production, verify with Apple's /verifyReceipt endpoint.
 */
async function verifyReceipt(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { receiptData, productId } = req.body;

    // TODO: Replace with real Apple verification
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const subscription = await Subscription.findOneAndUpdate(
      { user: req.userId },
      {
        tier: 'premium',
        status: 'active',
        productId,
        startDate,
        expiryDate,
        purchaseDate: startDate,
        autoRenewEnabled: true,
      },
      { new: true, upsert: true }
    );

    res.json({ verified: true, subscription });
  } catch (err) { next(err); }
}

export const subscriptionsRouter = Router();
subscriptionsRouter.use(authenticate);
subscriptionsRouter.get('/status', getStatus);
subscriptionsRouter.post('/verify', validate(verifySchema), verifyReceipt);
