import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  title: string;
  description: string;
  iconName: string;
  domain?: string | null;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    iconName: { type: String, required: true },
    domain: {
      type: String,
      enum: ['health', 'finance', 'productivity', 'mindfulness', null],
      default: null,
    },
  },
  { timestamps: true }
);

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);

// ─── UserAchievement ─────────────────────────────────────────────────────────

export interface IUserAchievement extends Document {
  user: mongoose.Types.ObjectId;
  achievement: mongoose.Types.ObjectId;
  unlockedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    achievement: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export const UserAchievement = mongoose.model<IUserAchievement>(
  'UserAchievement',
  UserAchievementSchema
);
