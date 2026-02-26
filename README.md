# LifeDeck Backend API

Production-ready Express + TypeScript backend for the LifeDeck iOS app.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 + TypeScript 5 |
| Framework | Express 4 |
| Database | MongoDB 7 + Mongoose 8 |
| Cache | Redis 7 (ioredis) |
| Queue | BullMQ 4 |
| Auth | JWT (access 15min / refresh 7d) |
| Validation | Zod |
| Logging | Winston |
| Testing | Jest + Supertest + mongodb-memory-server |

## Quick Start

### 1. Clone and install dependencies
```bash
git clone <repo>
cd lifedeck-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your secrets
```

### 3. Start with Docker (recommended)
```bash
docker compose up
```

### 4. Or start locally (requires MongoDB + Redis running)
```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | HTTP port | `3000` |
| `DATABASE_URL` | MongoDB connection string | — |
| `REDIS_URL` | Redis connection string | — |
| `JWT_SECRET` | Access token signing secret (min 16 chars) | — |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (min 16 chars) | — |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `CORS_ORIGIN` | Comma-separated allowed origins | — |

## API Reference

Base URL: `https://api.lifedeck.app/v1`

All authenticated endpoints require: `Authorization: Bearer <access_token>`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/register` | Register a new user |
| POST | `/v1/auth/login` | Login |
| POST | `/v1/auth/refresh` | Rotate refresh token |
| POST | `/v1/auth/logout` | Invalidate session |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/users/profile` | Get full profile |
| PUT | `/v1/users/profile` | Update name/email |
| GET | `/v1/users/settings` | Get settings |
| PUT | `/v1/users/settings` | Update settings |
| GET | `/v1/users/export` | GDPR data export |
| DELETE | `/v1/users/account` | Delete account |

### Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/cards/daily` | Today's coaching cards |
| POST | `/v1/cards/:id/complete` | Complete a card |
| POST | `/v1/cards/:id/snooze` | Snooze a card |
| POST | `/v1/cards/:id/bookmark` | Toggle bookmark |
| PUT | `/v1/cards/:id/note` | Add/update note |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/goals` | List goals |
| POST | `/v1/goals` | Create goal |
| PUT | `/v1/goals/:id` | Update goal |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/achievements` | All achievements with unlock status |
| GET | `/v1/subscription/status` | Subscription info |
| POST | `/v1/subscription/verify` | Verify Apple receipt |
| GET | `/v1/analytics/dashboard` | Dashboard data |

## Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

## Background Workers

Workers run as separate processes:

```bash
npm run worker:cards       # Daily card generation (00:00 UTC)
npm run worker:analytics   # Hourly analytics aggregation
npm run worker:streak      # Daily streak reset (00:05 UTC)
```

## Error Format

All errors follow this consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {}
  }
}
```

## Project Structure

```
src/
├── server.ts              # Entry point
├── app.ts                 # Express app factory
├── config/                # DB, Redis, BullMQ, env config
├── models/                # 13 Mongoose models
├── modules/               # Feature modules (auth, users, cards, etc.)
│   └── {feature}/
│       ├── *.controller.ts
│       ├── *.service.ts
│       └── *.validation.ts
├── middleware/            # Error handler, auth, rate limiter, Zod validator
├── utils/                 # Logger, helpers
└── workers/               # BullMQ background job workers
```
