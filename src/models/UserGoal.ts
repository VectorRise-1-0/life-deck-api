import mongoose, { Document, Schema } from 'mongoose';
import { Domain } from './UserFocusArea';

export interface IUserGoal extends Document {
  user: mongoose.Types.ObjectId;
  domain: Domain;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isCompleted: boolean;
}

const UserGoalSchema = new Schema<IUserGoal>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    domain: {
      type: String,
      enum: ['health', 'finance', 'productivity', 'mindfulness'],
      required: true,
    },
    description: { type: String, required: true },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserGoalSchema.index({ user: 1 });

export const UserGoal = mongoose.model<IUserGoal>('UserGoal', UserGoalSchema);
