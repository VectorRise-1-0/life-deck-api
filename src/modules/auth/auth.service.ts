import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../../models/User';
import { RefreshToken } from '../../models/RefreshToken';
import { UserProgress } from '../../models/UserProgress';
import { UserSettings } from '../../models/UserSettings';
import { Subscription } from '../../models/Subscription';
import { Streak } from '../../models/Streak';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error-handler';
import { RegisterInput, LoginInput } from './auth.validation';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  await RefreshToken.create({ user: userId, token, expiresAt });
}

/** Initialises companion records for a new user */
async function bootstrapUser(userId: string): Promise<void> {
  await Promise.all([
    UserProgress.create({ user: userId }),
    UserSettings.create({ user: userId }),
    Subscription.create({ user: userId }),
    Streak.create({ user: userId }),
  ]);
}

export async function register(input: RegisterInput) {
  const exists = await User.findOne({ email: input.email });
  if (exists) throw new AppError(409, 'EMAIL_IN_USE', 'An account with that email already exists');

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  const user = await User.create({ name: input.name, email: input.email, passwordHash });

  await bootstrapUser(String(user._id));

  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(String(user._id), refreshToken);

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token: accessToken,
    refreshToken,
  };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email });
  if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(String(user._id), refreshToken);

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token: accessToken,
    refreshToken,
  };
}

export async function refresh(token: string) {
  const record = await RefreshToken.findOne({ token });
  if (!record) throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');

  // Rotate: delete old, issue new
  await record.deleteOne();

  const accessToken = generateAccessToken(String(record.user));
  const newRefreshToken = generateRefreshToken();
  await storeRefreshToken(String(record.user), newRefreshToken);

  return { token: accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string, refreshToken?: string): Promise<void> {
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken, user: userId });
  } else {
    // Invalidate all sessions
    await RefreshToken.deleteMany({ user: userId });
  }
}
