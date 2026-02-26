import { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import * as authService from './auth.service';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.validation';
import { validate } from '../../middleware/validator';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rate-limiter';

async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.userId!, req.body.refreshToken);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validate(registerSchema), register);
authRouter.post('/login', authRateLimiter, validate(loginSchema), login);
authRouter.post('/refresh', validate(refreshSchema), refreshToken);
authRouter.post('/logout', authenticate, validate(logoutSchema), logout);
