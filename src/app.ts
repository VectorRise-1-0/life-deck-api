import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { rateLimiter } from './middleware/rate-limiter';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

// Routers
import { authRouter } from './modules/auth/auth.controller';
import { usersRouter } from './modules/users/users.controller';
import { cardsRouter } from './modules/cards/cards.controller';
import { goalsRouter } from './modules/goals/goals.controller';
import { achievementsRouter } from './modules/achievements/achievements.controller';
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.controller';
import { analyticsRouter } from './modules/analytics/analytics.controller';
import { progressRouter } from './modules/progress/progress.controller';

export function createApp() {
  const app = express();

  // ─── CORS ───────────────────────────────────────────────────────────────────
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(cors({ origin: allowedOrigins, credentials: true }));

  // ─── Body parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Rate limiting ───────────────────────────────────────────────────────────
  app.use(rateLimiter);

  // ─── Request logging ─────────────────────────────────────────────────────────
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // ─── Health check ────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

  // ─── API Routes ───────────────────────────────────────────────────────────────
  app.use('/v1/auth', authRouter);
  app.use('/v1/users', usersRouter);
  app.use('/v1/users/progress', progressRouter);
  app.use('/v1/cards', cardsRouter);
  app.use('/v1/goals', goalsRouter);
  app.use('/v1/achievements', achievementsRouter);
  app.use('/v1/subscription', subscriptionsRouter);
  app.use('/v1/analytics', analyticsRouter);

  // ─── 404 handler ─────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  // ─── Global error handler ────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
