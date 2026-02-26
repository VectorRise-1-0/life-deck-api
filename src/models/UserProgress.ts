import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProgress extends Document {
  user: mongoose.Types.ObjectId;
  healthScore: number;
  financeScore: number;
  productivityScore: number;
  mindfulnessScore: number;
  lifeScore: number;
  currentStreak: number;
  longestStreak: number;
  lifePoints: number;
  totalCardsCompleted: number;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    healthScore: { type: Number, default: 50.0, min: 0, max: 100 },
    financeScore: { type: Number, default: 50.0, min: 0, max: 100 },
    productivityScore: { type: Number, default: 50.0, min: 0, max: 100 },
    mindfulnessScore: { type: Number, default: 50.0, min: 0, max: 100 },
    lifeScore: { type: Number, default: 50.0, min: 0, max: 100 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lifePoints: { type: Number, default: 0 },
    totalCardsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
