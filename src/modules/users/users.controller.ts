import { Response, NextFunction, Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validator';
import { updateProfileSchema, updateSettingsSchema } from './users.validation';
import * as usersService from './users.service';

async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await usersService.getProfile(req.userId!);
    res.json(data);
  } catch (err) { next(err); }
}

async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateProfile(req.userId!, req.body);
    res.json({ user });
  } catch (err) { next(err); }
}

async function getSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const settings = await usersService.getSettings(req.userId!);
    res.json({ settings });
  } catch (err) { next(err); }
}

async function updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const settings = await usersService.updateSettings(req.userId!, req.body);
    res.json({ settings });
  } catch (err) { next(err); }
}

async function exportData(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await usersService.exportUserData(req.userId!);
    res.json(data);
  } catch (err) { next(err); }
}

async function deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await usersService.deleteAccount(req.userId!);
    res.status(204).send();
  } catch (err) { next(err); }
}

export const usersRouter = Router();
usersRouter.use(authenticate);

usersRouter.get('/profile', getProfile);
usersRouter.put('/profile', validate(updateProfileSchema), updateProfile);
usersRouter.get('/settings', getSettings);
usersRouter.put('/settings', validate(updateSettingsSchema), updateSettings);
usersRouter.get('/export', exportData);
usersRouter.delete('/account', deleteAccount);
