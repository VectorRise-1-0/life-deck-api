import mongoose, { Document, Schema } from 'mongoose';

export interface IStreak extends Document {
  user: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  dailyStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
  lastActivityDate?: Date;
}

const StreakSchema = new Schema<IStreak>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },
    weeklyStreak: { type: Number, default: 0 },
    monthlyStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
  },
  { timestamps: true }
);

export const Streak = mongoose.model<IStreak>('Streak', StreakSchema);
