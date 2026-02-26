import mongoose, { Document, Schema } from 'mongoose';

export interface ICardAnalytics extends Document {
  user: mongoose.Types.ObjectId;
  card: mongoose.Types.ObjectId;
  actionDate: Date;
  actionType: 'completed' | 'snoozed' | 'skipped' | 'bookmarked';
  completionTimeSeconds?: number;
}

const CardAnalyticsSchema = new Schema<ICardAnalytics>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    card: { type: Schema.Types.ObjectId, ref: 'CoachingCard', required: true },
    actionDate: { type: Date, required: true },
    actionType: {
      type: String,
      enum: ['completed', 'snoozed', 'skipped', 'bookmarked'],
      required: true,
    },
    completionTimeSeconds: { type: Number },
  },
  { timestamps: true }
);

CardAnalyticsSchema.index({ user: 1, actionDate: 1 });
CardAnalyticsSchema.index({ card: 1 });

export const CardAnalytics = mongoose.model<ICardAnalytics>('CardAnalytics', CardAnalyticsSchema);
