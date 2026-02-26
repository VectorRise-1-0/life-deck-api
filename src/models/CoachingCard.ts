import mongoose, { Document, Schema } from 'mongoose';
import { Domain } from './UserFocusArea';

export interface ICoachingCard extends Document {
  title: string;
  description: string;
  domain: Domain;
  actionText: string;
  difficulty: number;
  points: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: 'quick' | 'short' | 'standard' | 'extended';
  isPremium: boolean;
  aiGenerated: boolean;
  tags: string[];
  impact: number;
}

const CoachingCardSchema = new Schema<ICoachingCard>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    domain: {
      type: String,
      enum: ['health', 'finance', 'productivity', 'mindfulness'],
      required: true,
    },
    actionText: { type: String, required: true },
    difficulty: { type: Number, default: 1.0, min: 0, max: 10 },
    points: { type: Number, default: 10 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    estimatedDuration: {
      type: String,
      enum: ['quick', 'short', 'standard', 'extended'],
      default: 'standard',
    },
    isPremium: { type: Boolean, default: false },
    aiGenerated: { type: Boolean, default: true },
    tags: [{ type: String }],
    impact: { type: Number, default: 5.0 },
  },
  { timestamps: true }
);

CoachingCardSchema.index({ domain: 1 });
CoachingCardSchema.index({ isPremium: 1 });

export const CoachingCard = mongoose.model<ICoachingCard>('CoachingCard', CoachingCardSchema);
